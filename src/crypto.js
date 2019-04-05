import tweetnacl from 'tweetnacl';
import blakejs from 'blakejs';

export class Crypto {
  static binToHex(s) {
    if (s.constructor !== Uint8Array) {
      throw new TypeError('Expected Uint8Array');
    }
    return Buffer.from(s).toString('hex');
  }

  static hexToBin(s) {
    if (typeof s !== 'string') {
      throw new TypeError('Expected string: ' + s);
    }
    return new Uint8Array(Buffer.from(s, 'hex'));
  }

  static hashBin(s) {
    return blakejs.blake2b(s);
  }

  static genKeyPair() {
    const keyPair = tweetnacl.sign.keyPair();
    const publicKey = Crypto.binToHex(keyPair.publicKey);
    const secretKey = Crypto.binToHex(keyPair.secretKey).slice(0, 64);
    return { publicKey, secretKey };
  }

  static sign(msg, keyPair) {
    if (!keyPair.publicKey || !keyPair.secretKey) {
      throw new TypeError(
        `Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': ${JSON.stringify(
          keyPair
        )}`
      );
    }
    const hashBin = Crypto.hashBin(msg);
    const hash = Crypto.binToHex(hashBin);
    const sig = Crypto.binToHex(
      tweetnacl.sign.detached(hashBin, Crypto.hexToBin(keyPair.secretKey + keyPair.publicKey))
    );
    return { hash, sig, pubKey: keyPair.publicKey };
  }
}
