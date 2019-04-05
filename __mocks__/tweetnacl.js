const tweetnacl = jest.genMockFromModule('tweetnacl');

function detached(hash, bin) {
  return new Uint8Array(Buffer.from('abcdef1234567890', 'hex'));
}

function keyPair() {
  return {
    publicKey: new Uint8Array(Buffer.from('1234567890', 'hex')),
    secretKey: new Uint8Array(Buffer.from('abcdef', 'hex'))
  };
}

tweetnacl.sign.detached = detached;
tweetnacl.sign.keyPair = keyPair;

module.exports = tweetnacl;
