import { expect } from 'chai';
import { Client } from '../../../src/models/client';
import { Realm } from '../../../src/models/realm';
import { IMessage } from '../../../src/models/message';
import { MessagesExpire } from '../../../src/services/messagesExpire';
import { MessageHandler } from '../../../src/messageHandler';
import { MessageType } from '../../../src/enums';
import { wait } from '../../utils';

describe('MessagesExpire', () => {
  const createTestMessage = (dst: string): IMessage => {
    return {
      type: MessageType.OPEN,
      src: 'src',
      dst,
    };
  };

  it('should remove client if no read from queue', async () => {
    const realm = new Realm();
    const messageHandler = new MessageHandler(realm);
    const checkInterval = 10;
    const expireTimeout = 50;
    const config = { cleanup_out_msgs: checkInterval, expire_timeout: expireTimeout };

    const messagesExpire = new MessagesExpire({ realm, config, messageHandler });

    const client = new Client({ id: 'id', token: '' });
    realm.setClient(client, 'id');
    realm.addMessageToQueue(client.getId(), createTestMessage('dst'));

    messagesExpire.startMessagesExpiration();

    await wait(checkInterval * 2);

    expect(realm.getMessageQueueById(client.getId())?.getMessages().length).to.be.eq(1);

    await wait(expireTimeout);

    expect(realm.getMessageQueueById(client.getId())).to.be.undefined;

    messagesExpire.stopMessagesExpiration();
  });

  it('should fire EXPIRE message', async () => {
    const realm = new Realm();
    const messageHandler = new MessageHandler(realm);
    const checkInterval = 10;
    const expireTimeout = 50;
    const config = { cleanup_out_msgs: checkInterval, expire_timeout: expireTimeout };

    const messagesExpire = new MessagesExpire({ realm, config, messageHandler });

    const client = new Client({ id: 'id', token: '' });
    realm.setClient(client, 'id');
    realm.addMessageToQueue(client.getId(), createTestMessage('dst1'));
    realm.addMessageToQueue(client.getId(), createTestMessage('dst2'));

    let handledCount = 0;

    messageHandler.handle = (client, message): boolean => {
      expect(client).to.be.undefined;
      expect(message.type).to.be.eq(MessageType.EXPIRE);

      handledCount++;

      return true;
    };

    messagesExpire.startMessagesExpiration();

    await wait(checkInterval * 2);
    await wait(expireTimeout);

    expect(handledCount).to.be.eq(2);

    messagesExpire.stopMessagesExpiration();
  });
});
