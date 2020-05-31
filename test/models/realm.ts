import { expect } from 'chai';
import { Realm } from '../../src/models/realm';
import { Client } from '../../src/models/client';

describe('Realm', () => {
  describe('#generateClientId', () => {
    it('should generate a 36-character UUID, or return function value', () => {
      const realm = new Realm();
      expect(realm.generateClientId().length).to.eq(36);
      expect(realm.generateClientId(() => 'abcd')).to.eq('abcd');
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
