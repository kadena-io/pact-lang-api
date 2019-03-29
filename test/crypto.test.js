import blakejs from 'blakejs';
import tweetnacl from 'tweetnacl';
import { Crypto } from '../src/crypto';

jest.mock('tweetnacl');

describe('Crypto Class', () => {
  test('Crypto.binToHex(s)', () => {
    const input = new Uint8Array(Buffer.from('string', 'hex'));
    const expected = Buffer.from(input).toString('hex');
    const actual = Crypto.binToHex(input);
    expect(actual).toEqual(expected);
  });

  test('Crypto.binToHex(s) should throw error on incorrect input type', () => {
    expect(() => {
      Crypto.binToHex('string');
    }).toThrow();
  });

  test('hexToBin(s)', () => {
    const input = 'some input';
    const expected = new Uint8Array(Buffer.from(input, 'hex'));
    const actual = Crypto.hexToBin(input);
    expect(actual).toEqual(expected);
  });

  test('Crypto.hexToBin(s) should throw error on incorrect input type', () => {
    expect(() => {
      Crypto.binToHex(123);
    }).toThrow();
  });

  test('hashBin(s)', () => {
    const input = 'some input';
    const expected = blakejs.blake2b(input);
    const actual = Crypto.hashBin(input);
    expect(actual).toEqual(expected);
  });

  test('genKeyPair()', () => {
    const mockKeyPair = tweetnacl.sign.keyPair();
    const expected = {
      publicKey: Crypto.binToHex(mockKeyPair.publicKey),
      secretKey: Crypto.binToHex(mockKeyPair.secretKey).slice(0, 64)
    };
    const actual = Crypto.genKeyPair();
    expect(actual).toEqual(expected);
  });

  test('sign(msg, keyPair)', () => {
    const mockMsg = 'some message';
    const mockKeyPair = tweetnacl.sign.keyPair();
    const mockSig = Crypto.binToHex(
      tweetnacl.sign.detached(
        Crypto.hashBin(mockMsg),
        Crypto.hexToBin(mockKeyPair.secretKey + mockKeyPair.publicKey)
      )
    );
    const expected = {
      hash: Crypto.binToHex(Crypto.hashBin(mockMsg)),
      sig: mockSig,
      pubKey: mockKeyPair.publicKey
    };
    const actual = Crypto.sign(mockMsg, mockKeyPair);
  });

  test('Crypto.sign(msg, keyPair) should throw error on incorrect keyPair', () => {
    expect(() => {
      Crypto.sign('message', { pub: 'pub', key: 'key' });
    }).toThrow();
  });
});
