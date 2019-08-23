import { MessageType } from "../enums";
import { IClient } from "../models/client";
import { IMessage } from "../models/message";
import { IRealm } from "../models/realm";
import { Handler } from "./handler";
import { HeartbeatHandler, TransmissionHandler } from "./handlers";
import { IMessageHandlers, MessageHandlers } from "./messageHandlers";

export interface IMessageHandler {
  handle(client: IClient, message: IMessage): boolean;
}

export class MessageHandler implements IMessageHandler {
  private readonly messageHandlers: IMessageHandlers = new MessageHandlers();

  constructor(realm: IRealm) {
    const transmissionHandler: Handler = TransmissionHandler({ realm });
    const heartbeatHandler: Handler = HeartbeatHandler;

    const handleTransmission: Handler = (client: IClient, message: IMessage): boolean => {
      return transmissionHandler(client, {
        type: message.type,
        src: message.src,
        dst: message.dst,
        payload: message.payload
      });
    };

    const handleHeartbeat = (client: IClient, message: IMessage) => heartbeatHandler(client, message);

    this.messageHandlers.registerHandler(MessageType.HEARTBEAT, handleHeartbeat);
    this.messageHandlers.registerHandler(MessageType.OFFER, handleTransmission);
    this.messageHandlers.registerHandler(MessageType.ANSWER, handleTransmission);
    this.messageHandlers.registerHandler(MessageType.CANDIDATE, handleTransmission);
    this.messageHandlers.registerHandler(MessageType.LEAVE, handleTransmission);
    this.messageHandlers.registerHandler(MessageType.EXPIRE, handleTransmission);
  }

  public handle(client: IClient, message: IMessage): boolean {
    return this.messageHandlers.handle(client, message);
  }
}
