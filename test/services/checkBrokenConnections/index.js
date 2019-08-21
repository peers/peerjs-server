const { expect } = require('chai');
const Client = require('../../../src/models/client');
const Realm = require('../../../src/models/realm');
const checkBrokenConnectionsBuilder = require('../../../src/services/checkBrokenConnections');

describe('checkBrokenConnections service', () => {
    it('should remove client after 2 checks', (done) => {
        const realm = new Realm();
        const doubleCheckTime = 55;//~ equals to checkBrokenConnections.CHECK_INTERVAL * 2
        const checkBrokenConnections = checkBrokenConnectionsBuilder({ realm, config: { alive_timeout: doubleCheckTime }, checkInterval: 30 });
        const client = new Client({ id: 'id', token: '' });
        realm.setClient(client, 'id');

        checkBrokenConnections.start();

        setTimeout(() => {
            expect(realm.getClientById('id')).to.be.undefined;
            checkBrokenConnections.stop();
            done();
        }, checkBrokenConnections.CHECK_INTERVAL * 2 + 3);
    });

    it('should remove client after 1 ping', (done) => {
        const realm = new Realm();
        const doubleCheckTime = 55;//~ equals to checkBrokenConnections.CHECK_INTERVAL * 2
        const checkBrokenConnections = checkBrokenConnectionsBuilder({ realm, config: { alive_timeout: doubleCheckTime }, checkInterval: 30 });
        const client = new Client({ id: 'id', token: '' });
        realm.setClient(client, 'id');

        checkBrokenConnections.start();

        //set ping after first check
        setTimeout(() => {
            client.setLastPing(new Date().getTime());

            setTimeout(() => {
                expect(realm.getClientById('id')).to.be.undefined;
                checkBrokenConnections.stop();
                done();
            }, checkBrokenConnections.CHECK_INTERVAL * 2 + 10);
        }, checkBrokenConnections.CHECK_INTERVAL);
    });
});
