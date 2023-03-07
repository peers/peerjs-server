import type WebSocket from "ws";

export interface IClient {
	getId(): string;

	getToken(): string;

	getSocket(): WebSocket | null;

	setSocket(socket: WebSocket | null): void;

	getLastPing(): number;

	setLastPing(lastPing: number): void;

	send<T>(data: T): void;
}

export class Client implements IClient {
	private readonly id: string;
	private readonly token: string;
	private socket: WebSocket | null = null;
	private lastPing: number = new Date().getTime();

	constructor({ id, token }: { id: string; token: string }) {
		this.id = id;
		this.token = token;
	}

	public getId(): string {
		return this.id;
	}

	public getToken(): string {
		return this.token;
	}

	public getSocket(): WebSocket | null {
		return this.socket;
	}

	public setSocket(socket: WebSocket | null): void {
		this.socket = socket;
	}

	public getLastPing(): number {
		return this.lastPing;
	}

	public setLastPing(lastPing: number): void {
		this.lastPing = lastPing;
	}

	public send<T>(data: T): void {
		this.socket?.send(JSON.stringify(data));
	}
}
