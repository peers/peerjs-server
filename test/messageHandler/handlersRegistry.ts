import { expect } from 'chai';
import { HandlersRegistry } from '../../src/messageHandler/handlersRegistry';
import { Handler } from '../../src/messageHandler/handler';
import { MessageType } from '../../src/enums';

describe('HandlersRegistry', () => {
  it('should execute handler for message type', () => {
    const handlersRegistry = new HandlersRegistry();

    let handled = false;

    const handler: Handler = (): boolean => {
      handled = true;
      return true;
    };

    handlersRegistry.registerHandler(MessageType.OPEN, handler);

    handlersRegistry.handle(undefined, { type: MessageType.OPEN, src: 'src', dst: 'dst' });

    expect(handled).to.be.true;
  });
});
