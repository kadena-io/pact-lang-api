var test = require('tape');
var Pact = require("./../pact-lang-api.js")

// test Pact.crpyto.binToHex()
test('takes in binary array buffer and returns hex', function (t) {
  var actual = Pact.crypto.binToHex()
  t.equals("VGVzdGluZyBiYXNlNjRVcmxFbmNvZGUoKQ", base46url);
  t.end();
});
// test Pact.crpyto.hexToBin()
test('takes in hex and returns binary array buffer', function (t) {
  var actual = Pact.crypto.hexToBin()
  t.equals();
  t.end();
});
// test Pact.crypto.base64UrlEncode()
test('takes in text and returns Bsae 64 URL encoded string', function (t) {
  var actual = Pact.crypto.base64UrlEncode('Testing base64UrlEncode()')
  t.equals("VGVzdGluZyBiYXNlNjRVcmxFbmNvZGUoKQ", actual);
  t.end();
});

// test Pact.crypto.hash()
test('takes in text and returns hash', function (t) {
  var actual = Pact.crypto.hash('Testing hash')
  t.equals("", actual);
  t.end();
});

// test Pact.crypto.sign()
test("takes in msg and keypair, returns object with hash and signature", function(t){
  var actual = Pact.crypto.sign(msg, keyPair);
  var hshBin = hashBin(msg);
  var hsh = base64UrlEncode(hshBin);
  var sigBin = nacl.sign.detached(hshBin, toTweetNaclSecretKey(keyPair));
  t.deepEqual(actual, { hash: hsh, sig: binToHex(sigBin), pubKey: keyPair.publicKey })
  t.end()
})

// test Pact.crypto.toTweetNaclSecretKey()
test("", function(t){
  var actual = Pact.crypto.toTweetNaclSecretKey()
  t.deepEqual(actual, {})
  t.end()
})
