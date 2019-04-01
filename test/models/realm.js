const { expect } = require('chai');
const Realm = require('../../src/models/realm');
const Client = require('../../src/models/client');

describe('Realm', () => {
  describe('#generateClientId', () => {
    it('should generate a 16-character ID', () => {
      const realm = new Realm();
      expect(realm.generateClientId().length).to.eq(16);
    });
  });

  describe('#setClient', () => {
    it('should add client to realm', () => {
      const realm = new Realm();
      const client = new Client({ id: 'id', token: '' });

      realm.setClient(client, 'id');
      expect(realm.getClientsIds()).to.deep.eq(['id']);
    });
  });

  describe('#removeClientById', () => {
    it('should remove client from realm', () => {
      const realm = new Realm();
      const client = new Client({ id: 'id', token: '' });

      realm.setClient(client, 'id');
      realm.removeClientById('id');

      expect(realm.getClientById('id')).to.be.undefined;
    });
  });

  describe('#getClientsIds', () => {
    it('should reflects on add/remove childs', () => {
      const realm = new Realm();
      const client = new Client({ id: 'id', token: '' });

      realm.setClient(client, 'id');
      expect(realm.getClientsIds()).to.deep.eq(['id']);

      expect(realm.getClientById('id')).to.eq(client);

      realm.removeClientById('id');
      expect(realm.getClientsIds()).to.deep.eq([]);
    });
  });
});
