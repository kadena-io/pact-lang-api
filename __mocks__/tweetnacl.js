const tweetnacl = jest.genMockFromModule("tweetnacl");

function detached(hash, bin) {
  return new Uint8Array(Buffer.from("sig", "hex"));
}

function keyPair() {
  return {
    publicKey: new Uint8Array(Buffer.from("publicKey", "hex")),
    secretKey: new Uint8Array(Buffer.from("secretKey", "hex"))
  };
}

tweetnacl.sign.detached = detached;
tweetnacl.sign.keyPair = keyPair;

module.exports = tweetnacl;
