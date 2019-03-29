import tweetnacl from 'tweetnacl';
import { Crypto } from '../src/crypto';
import { Pact } from "../src/pact";

describe.skip('Pact Class', () => {
  beforeAll(() => {
    const mockKeyPair = tweetnacl.sign.keyPair();
    const mockSig = Crypto.binToHex(
      tweetnacl.sign.detached(
        Crypto.hashBin(mockMsg),
        Crypto.hexToBin(mockKeyPair.secretKey + mockKeyPair.publicKey)
      )
    );

    Crypto.mockImplementation(() => {
      return {
        genKeyPair: () => {
          return mockKeyPair;
        },
        sign: () => {
          return mockSig;
        }
      };
    });
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test.skip('sendCommand({ command, data, host, keyPairs }) returns successfully', async () => {
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
      host: 'localhost'
    });

    expect(actual).toEqual(expected);
  });

  test.skip('simpleExecCommand({ keyPairs, code, data = {}, address })', () => {
    const expected = { cmds: [{ hash, sigs, cmd }] };
    const actual = Pact.simpleExecCommand({
      keyPairs: mockKeyPair,
      code: 'do-something',
      data: {},
      address: mockAddress
    });
    expect(actual).toEqual(expected);
  });
});
