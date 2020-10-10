import { expect } from 'chai';
import { MessageQueue } from '../../src/models/messageQueue';
import { MessageType } from '../../src/enums';
import { IMessage } from '../../src/models/message';
import { wait } from '../utils';

describe('MessageQueue', () => {
  const createTestMessage = (): IMessage => {
    return {
      type: MessageType.OPEN,
      src: 'src',
      dst: 'dst'
    };
  };

  describe('#addMessage', () => {
    it('should add message to queue', () => {
      const queue = new MessageQueue();
      queue.addMessage(createTestMessage());
      expect(queue.getMessages().length).to.eq(1);
    });
  });

  describe('#readMessage', () => {
    it('should return undefined for empty queue', () => {
      const queue = new MessageQueue();
      expect(queue.readMessage()).to.be.undefined;
    });

    it('should return message if any exists in queue', () => {
      const queue = new MessageQueue();
      const message = createTestMessage();
      queue.addMessage(message);

      expect(queue.readMessage()).to.deep.eq(message);
      expect(queue.readMessage()).to.be.undefined;
    });
  });

  describe('#getLastReadAt', () => {
    it('should not be changed if no messages when read', () => {
      const queue = new MessageQueue();
      const lastReadAt = queue.getLastReadAt();
      queue.readMessage();
      expect(queue.getLastReadAt()).to.be.eq(lastReadAt);
    });

    it('should be changed when read message', async () => {
      const queue = new MessageQueue();
      const lastReadAt = queue.getLastReadAt();
      queue.addMessage(createTestMessage());

      await wait(10);

      expect(queue.getLastReadAt()).to.be.eq(lastReadAt);

      queue.readMessage();

      expect(queue.getLastReadAt()).to.be.gte(lastReadAt + 10);
    });
  });
});
