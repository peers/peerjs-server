import uuidv4 from "uuid/v4";
import { IClient, Client } from "./client";
import { IMessage } from "./message";
import { IMessageQueue, MessageQueue } from "./messageQueue";
import { clog } from "../utils";

const Redis = require("ioredis");
const os = require("os");

const redisHost =
  process.env.NODE_ENV === "development"
    ? "127.0.0.1"
    : "fmqueue.7piuva.ng.0001.use1.cache.amazonaws.com";
const redisPort = 6379;

// const redisPub = new Redis();
const redisSub = new Redis(redisPort, redisHost);
const redisPub = new Redis(redisPort, redisHost);

export interface IRealm {
  getClientsIds(): string[];

  getClientById(clientId: string): IClient | undefined;

  getClientsIdsWithQueue(): string[];

  setClient(client: IClient, id: string): void;

  removeClientById(id: string): boolean;

  getMessageQueueById(id: string): IMessageQueue | undefined;

  addMessageToQueue(id: string, message: IMessage): void;

  clearMessageQueue(id: string): void;

  generateClientId(generateClientId?: () => string): string;
}

export class Realm implements IRealm {
  private readonly clients: Map<string, IClient> = new Map();
  private readonly messageQueues: Map<string, IMessageQueue> = new Map();

  constructor() {
    redisSub.subscribe("clients", (err: Error) => {
      if (!err) clog("Subscribed to Clients");
    });

    redisSub.on("message", (channel: string, message: any) => {
      if (channel === "clients") {
        const { client, id, host } = JSON.parse(message);
        if (host == os.hostname()) {
          clog("Same Host -------> Return");
          return;
        }
        const { token, lastPing } = client;
        const newClient: IClient = new Client({ id, token });
        newClient.setLastPing(lastPing);
        this.clients.set(id, newClient);
      }
    });
  }

  public getClientsIds(): string[] {
    return [...this.clients.keys()];
  }

  public getClientById(clientId: string): IClient | undefined {
    return this.clients.get(clientId);
  }

  public getClientsIdsWithQueue(): string[] {
    return [...this.messageQueues.keys()];
  }

  public setClient(client: IClient, id: string): void {
    this.clients.set(id, client);
    clog("Publish Client");
    redisPub.publish(
      "clients",
      JSON.stringify({
        client,
        id,
        host: os.hostname(),
      })
    );
  }

  public removeClientById(id: string): boolean {
    const client = this.getClientById(id);

    if (!client) return false;

    this.clients.delete(id);

    return true;
  }

  public getMessageQueueById(id: string): IMessageQueue | undefined {
    console.log("Getting MessageQueue");
    return this.messageQueues.get(id);
  }

  public addMessageToQueue(id: string, message: IMessage): void {
    console.log("Add MessageQueue");
    if (!this.getMessageQueueById(id)) {
      this.messageQueues.set(id, new MessageQueue());
    }

    this.getMessageQueueById(id)!.addMessage(message);
  }

  public clearMessageQueue(id: string): void {
    this.messageQueues.delete(id);
  }

  public generateClientId(generateClientId?: () => string): string {
    const generateId = generateClientId ? generateClientId : uuidv4;

    let clientId = generateId();

    while (this.getClientById(clientId)) {
      clientId = generateId();
    }
    console.log("Generate ID", clientId);

    return clientId;
  }
}
