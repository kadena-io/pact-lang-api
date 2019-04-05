import tweetnacl from 'tweetnacl';
import { Crypto } from '../src/crypto';
import { Pact } from '../src/pact';

const mockHash = 'abcdef1234';
const mockMsg = 'do-something';
const mockKeyPair = tweetnacl.sign.keyPair();
const mockSig = Crypto.binToHex(
  tweetnacl.sign.detached(
    Crypto.hashBin(mockMsg),
    Crypto.hexToBin(mockKeyPair.secretKey + mockKeyPair.publicKey)
  )
);
const mockAddress = 'localhost';

describe('Pact Class', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('sendCommand({ command, data, host, keyPairs }) returns successfully', async () => {
    const mockListenData = { key: 'val' };
    const mockSendResponse = JSON.stringify({
      status: 'success',
      cmds: [{ hash: 'somehash' }]
    });
    const mockListenResponse = JSON.stringify({
      status: 'success',
      response: {
        result: {
          status: 'success',
          data: mockListenData
        }
      }
    });

    // Mock Send and Listen Responses
    fetch.mockResponses([mockSendResponse], [mockListenResponse]);

    const expected = mockListenData;
    const actual = await Pact.sendCommand({
      command: 'do-something',
      data: {},
      host: 'localhost',
      keyPairs: [mockKeyPair]
    });

    expect(actual).toEqual(expected);
  });

  test('sendCommand() throws errors if no host', async () => {
    Pact.apiHost = undefined;
    try {
      await Pact.sendCommand({
        command: 'do-something',
        data: {},
        keyPairs: [mockKeyPair]
      });
    } catch (e) {
      expect(e.toString()).toMatch(
        'Pact.sendCommand(): No `host` provided, and Pact() not instantiated with `host`'
      );
    }
  });

  test('sendCommand() throws error if no keyPairs', async () => {
    Pact.keyPairs = undefined;
    try {
      await Pact.sendCommand({
        command: 'do-something',
        data: {},
        host: 'localhost'
      });
    } catch (e) {
      expect(e.toString()).toMatch(
        'Pact.sendCommand(): No `keyPairs` provided and Pact() not instantiated with `keyPairs`'
      );
    }
  });

  test('sendCommand() throws error if no command', async () => {
    Pact.keyPairs = undefined;
    try {
      await Pact.sendCommand({
        data: {},
        host: 'localhost',
        keyPairs: [mockKeyPair]
      });
    } catch (e) {
      expect(e.toString()).toMatch('Pact.sendCommand(): No `command` provided');
    }
  });

  test('sendCommand() throws error on send command failure', async () => {
    const mockListenData = { key: 'val' };
    const mockSendResponse = JSON.stringify({
      status: 'failure',
      error: 'Some error'
    });

    // Mock Send Responses
    fetch.mockResponses([mockSendResponse]);

    try {
      await Pact.sendCommand({
        command: 'do-something',
        data: {},
        host: 'localhost',
        keyPairs: [mockKeyPair]
      });
    } catch (e) {
      expect(e.toString()).toMatch('PACT Failure in do-something: Some error');
    }
  });

  test('sendCommand() throws error on listen failure', async () => {
    const mockListenData = { key: 'val' };
    const mockSendResponse = JSON.stringify({
      status: 'success',
      cmds: [{ hash: 'somehash' }]
    });
    const mockListenResponse = JSON.stringify({
      status: 'failure',
      error: 'Some error',
      response: {
        result: {
          status: 'failure',
          data: mockListenData
        }
      }
    });

    // Mock Send and Listen Responses
    fetch.mockResponses([mockSendResponse], [mockListenResponse]);

    try {
      await Pact.sendCommand({
        command: 'do-something',
        data: {},
        host: 'localhost',
        keyPairs: [mockKeyPair]
      });
    } catch (e) {
      expect(e.toString()).toMatch(
        'PACT Failure in do-something listen: Some error'
      );
    }
  });

  test('simpleExecCommand({ keyPairs, code, data = {}, address })', () => {
    const mockCode = 'do-something';
    const mockSig = Crypto.sign(mockCode, mockKeyPair);
    const expected = {
      cmds: [
        {
          hash: mockSig.hash,
          sigs: [mockSig],
          cmd:
            '{"nonce":"1554441763765","payload":{"exec":{"code":"do-something","data":{}}},"address":"localhost"}'
        }
      ]
    };
    const actual = Pact.simpleExecCommand({
      keyPairs: mockKeyPair,
      code: mockCode,
      data: {},
      address: mockAddress
    });

    const cmdRegex = /\{"nonce":"[^"]+","payload":\{"exec":\{"code":"do-something","data":\{\}\}\},"address":"localhost"\}/;

    expect(/[0-9a-f]{128}/.test(actual.cmds[0].hash)).toBe(true);
    expect(actual.cmds[0].sigs[0].hash).toEqual(actual.cmds[0].hash);
    expect(cmdRegex.test(actual.cmds[0].cmd)).toBe(true);
  });
});
