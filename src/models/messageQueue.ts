import { IMessage } from "./message";

export interface IMessageQueue {
  getLastReadAt(): number;

  addMessage(message: IMessage): void;

  readMessage(): IMessage | undefined;

  getMessages(): IMessage[];
}

export class MessageQueue implements IMessageQueue {
  private lastReadAt: number = new Date().getTime();
  private readonly messages: IMessage[] = [];

  public getLastReadAt(): number {
    return this.lastReadAt;
  }

  public addMessage(message: IMessage): void {
    this.messages.push(message);
  }

  public readMessage(): IMessage | undefined {
    if (this.messages.length > 0) {
      this.lastReadAt = new Date().getTime();
      return this.messages.shift()!;
    }

    return undefined;
  }

  public getMessages(): IMessage[] {
    return this.messages;
  }
}
