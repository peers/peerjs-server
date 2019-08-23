const { expect } = require('chai');
const { Client } = require('../../../../dist/src/models/client');
const { HeartbeatHandler } = require('../../../../dist/src/messageHandler/handlers');

describe('Heartbeat handler', () => {
    it('should update last ping time', () => {
        const client = new Client({ id: 'id', token: '' });
        client.setLastPing(0);

        const nowTime = new Date().getTime();

        HeartbeatHandler(client);

        expect(client.getLastPing()).to.be.closeTo(nowTime, 2);
    });
});
