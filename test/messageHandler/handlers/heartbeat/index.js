const { expect } = require('chai');
const Client = require('../../../../src/models/client');
const heartbeatHandler = require('../../../../src/messageHandler/handlers/heartbeat');

describe('Heartbeat handler', () => {
    it('should update last ping time', () => {
        const client = new Client({ id: 'id', token: '' });
        client.setLastPing(0);

        const nowTime = new Date().getTime();

        heartbeatHandler(client);

        expect(client.getLastPing()).to.be.closeTo(nowTime, 2);
    });
});
