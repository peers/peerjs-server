import { expect } from 'chai';
import { Client } from '../../../../src/models/client';
import { TransmissionHandler } from '../../../../src/messageHandler/handlers';
import { Realm } from '../../../../src/models/realm';
import { MessageType } from '../../../../src/enums';
import { MyWebSocket } from '../../../../src/services/webSocketServer/webSocket';

const createFakeSocket = (): MyWebSocket => {
  /* eslint-disable @typescript-eslint/no-empty-function */
  const sock = {
    send: (): void => { },
    close: (): void => { },
    on: (): void => { },
  };
  /* eslint-enable @typescript-eslint/no-empty-function */

  return (sock as unknown as MyWebSocket);
};

describe('Transmission handler', () => {
  it('should save message in queue when destination client not connected', () => {
    const realm = new Realm();
    const handleTransmission = TransmissionHandler({ realm });

    const clientFrom = new Client({ id: 'id1', token: '' });
    const idTo = 'id2';
    realm.setClient(clientFrom, clientFrom.getId());

    handleTransmission(clientFrom, { type: MessageType.OFFER, src: clientFrom.getId(), dst: idTo });

    expect(realm.getMessageQueueById(idTo)?.getMessages().length).to.be.eq(1);
  });

  it('should not save LEAVE and EXPIRE messages in queue when destination client not connected', () => {
    const realm = new Realm();
    const handleTransmission = TransmissionHandler({ realm });

    const clientFrom = new Client({ id: 'id1', token: '' });
    const idTo = 'id2';
    realm.setClient(clientFrom, clientFrom.getId());

    handleTransmission(clientFrom, { type: MessageType.LEAVE, src: clientFrom.getId(), dst: idTo });
    handleTransmission(clientFrom, { type: MessageType.EXPIRE, src: clientFrom.getId(), dst: idTo });

    expect(realm.getMessageQueueById(idTo)).to.be.undefined;
  });

  it('should send message to destination client when destination client connected', () => {
    const realm = new Realm();
    const handleTransmission = TransmissionHandler({ realm });

    const clientFrom = new Client({ id: 'id1', token: '' });
    const clientTo = new Client({ id: 'id2', token: '' });
    const socketTo = createFakeSocket();
    clientTo.setSocket(socketTo);
    realm.setClient(clientTo, clientTo.getId());

    let sent = false;
    socketTo.send = (): void => {
      sent = true;
    };

    handleTransmission(clientFrom, { type: MessageType.OFFER, src: clientFrom.getId(), dst: clientTo.getId() });

    expect(sent).to.be.true;
  });

  it('should send LEAVE message to source client when sending to destination client failed', () => {
    const realm = new Realm();
    const handleTransmission = TransmissionHandler({ realm });

    const clientFrom = new Client({ id: 'id1', token: '' });
    const clientTo = new Client({ id: 'id2', token: '' });
    const socketFrom = createFakeSocket();
    const socketTo = createFakeSocket();
    clientFrom.setSocket(socketFrom);
    clientTo.setSocket(socketTo);
    realm.setClient(clientFrom, clientFrom.getId());
    realm.setClient(clientTo, clientTo.getId());

    let sent = false;
    socketFrom.send = (data: string): void => {
      if (JSON.parse(data)?.type === MessageType.LEAVE) {
        sent = true;
      }
    };

    socketTo.send = (): void => {
      throw Error();
    };

    handleTransmission(clientFrom, { type: MessageType.OFFER, src: clientFrom.getId(), dst: clientTo.getId() });

    expect(sent).to.be.true;
  });
});
