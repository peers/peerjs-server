import { MyWebSocket } from "../services/webSocketServer/webSocket";

export interface IClient {
  getId(): string;

  getToken(): string;

  getSocket(): MyWebSocket | null;

  setSocket(socket: MyWebSocket | null): void;

  getLastPing(): number;

  setLastPing(lastPing: number): void;

  send(data: any): void;
}

export class Client implements IClient {
  private readonly id: string;
  private readonly token: string;
  private socket: MyWebSocket | null = null;
  private lastPing: number = new Date().getTime();

  constructor({ id, token }: { id: string, token: string; }) {
    this.id = id;
    this.token = token;
  }

  public getId(): string {
    return this.id;
  }

  public getToken(): string {
    return this.token;
  }

  public getSocket(): MyWebSocket | null {
    return this.socket;
  }

  public setSocket(socket: MyWebSocket | null): void {
    this.socket = socket;
  }

  public getLastPing(): number {
    return this.lastPing;
  }

  public setLastPing(lastPing: number): void {
    this.lastPing = lastPing;
  }

  public send(data: any): void {
    this.socket?.send(JSON.stringify(data));
  }
}
