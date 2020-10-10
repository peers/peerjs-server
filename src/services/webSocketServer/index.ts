import EventEmitter from "events";
import { IncomingMessage } from "http";
import url from "url";
import WebSocketLib from "ws";
import { IConfig } from "../../config";
import { Errors, MessageType } from "../../enums";
import { Client, IClient } from "../../models/client";
import { IRealm } from "../../models/realm";
import { MyWebSocket } from "./webSocket";

export interface IWebSocketServer extends EventEmitter {
  readonly path: string;
}

interface IAuthParams {
  id?: string;
  token?: string;
  key?: string;
}

type CustomConfig = Pick<IConfig, 'path' | 'key' | 'concurrent_limit'>;

type MessagesTransport = {
  registerHanadler(handler: (message: { type: string; dst?: string; } & any) => boolean): void;
  sendMessage(message: { type: string; src: string; } & any): void;
};

const WS_PATH = 'peerjs';

type Dependencies = {
  server: any;
  realm: IRealm;
  config: CustomConfig;
  messagesTransport?: MessagesTransport;
};

export class WebSocketServer extends EventEmitter implements IWebSocketServer {

  public readonly path: string;
  public readonly socketServer: WebSocketLib.Server;

  private readonly realm: IRealm;
  private readonly config: CustomConfig;
  private readonly messagesTransport?: MessagesTransport;

  constructor({ server, realm, config, messagesTransport }: Dependencies) {
    super();

    this.setMaxListeners(0);

    this.realm = realm;
    this.config = config;
    this.messagesTransport = messagesTransport;

    const path = this.config.path;
    this.path = `${path}${path.endsWith('/') ? "" : "/"}${WS_PATH}`;

    this.socketServer = new WebSocketLib.Server({ path: this.path, server });

    this.socketServer.on("connection", (socket: MyWebSocket, req) => this._onSocketConnection(socket, req));
    this.socketServer.on("error", (error: Error) => this._onSocketError(error));

    this.messagesTransport?.registerHanadler((message) => this._handleMessage(message));
  }

  private _onSocketConnection(socket: MyWebSocket, req: IncomingMessage): void {
    const { query = {} } = url.parse(req.url ?? '', true);

    const { id, token, key }: IAuthParams = query;

    if (!id || !token || !key) {
      return this._sendErrorAndClose(socket, Errors.INVALID_WS_PARAMETERS);
    }

    if (key !== this.config.key) {
      return this._sendErrorAndClose(socket, Errors.INVALID_KEY);
    }

    const client = this.realm.getClientById(id);

    if (client) {
      if (token !== client.getToken()) {
        // ID-taken, invalid token
        socket.send(JSON.stringify({
          type: MessageType.ID_TAKEN,
          payload: { msg: "ID is taken" }
        }));

        return socket.close();
      }

      return this._configureWS(socket, client);
    }

    this._registerClient({ socket, id, token });
  }

  private _onSocketError(error: Error): void {
    // handle error
    this.emit("error", error);
  }

  private _registerClient({ socket, id, token }:
    {
      socket: MyWebSocket;
      id: string;
      token: string;
    }): void {
    // Check concurrent limit
    const clientsCount = this.realm.getClientsIds().length;

    if (clientsCount >= this.config.concurrent_limit) {
      return this._sendErrorAndClose(socket, Errors.CONNECTION_LIMIT_EXCEED);
    }

    const newClient: IClient = new Client({ id, token });
    this.realm.setClient(newClient, id);
    socket.send(JSON.stringify({ type: MessageType.OPEN }));

    this._configureWS(socket, newClient);
  }

  private _configureWS(socket: MyWebSocket, client: IClient): void {
    client.setSocket(socket);

    // Cleanup after a socket closes.
    socket.on("close", () => {
      if (client.getSocket() === socket) {
        this.realm.removeClientById(client.getId());
        this.emit("close", client);
      }
    });

    // Handle messages from peers.
    socket.on("message", (data: WebSocketLib.Data) => {
      try {
        const message = JSON.parse(data as string);

        message.src = client.getId();

        if (message.type !== "HEARTBEAT" && this.messagesTransport) {
          this.messagesTransport.sendMessage(message);
          return;
        }

        this.emit("message", client, message);
      } catch (e) {
        this.emit("error", e);
      }
    });

    this.emit("connection", client);
  }

  private _sendErrorAndClose(socket: MyWebSocket, msg: Errors): void {
    socket.send(
      JSON.stringify({
        type: MessageType.ERROR,
        payload: { msg }
      })
    );

    socket.close();
  }

  private _handleMessage(message: any) {
    const clientId = message.dst;
    const client = clientId ? this.realm.getClientById(clientId) : undefined;

    if (!client) return false;

    this.emit("message", client, message);

    return true;
  }
}
