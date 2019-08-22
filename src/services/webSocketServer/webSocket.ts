import EventEmitter from "events";
import WebSocketLib from "ws";

export type MyWebSocket = WebSocketLib & EventEmitter;
