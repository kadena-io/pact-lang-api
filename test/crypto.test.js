var test = require('tape');
var Pact = require("./../pact-lang-api.js")

// Import Test Case
var { kp, cmd } = require("./test-case1.js")

// test Pact.crpyto.binToHex()
test('Takes in Uint8Array binary object and outputs hex string', function (t) {
  var binKp = new Uint8Array( [ 134, 147, 230,  65, 174,  43, 190, 158,
                                168,   2, 199,  54, 244,  32,  39, 176,
                                 63, 134, 175, 230,  60, 174,  49,  94,
                                113, 105, 201, 196, 150, 193, 115,  50,
                                186,  84, 178,  36, 209, 146,  77, 217,
                                132,   3, 245, 199,  81, 171, 221,  16,
                                222, 108, 216,  27,   1,  33, 128,  11,
                                247, 189, 189, 207, 174, 199,  56, 141 ])
  var actual = Pact.crypto.binToHex(binKp)

  var expected = '8693e641ae2bbe9ea802c736f42027b03f86afe63cae315e7169c9c496c17332ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d'
  t.equals(actual, expected);
  t.end();
});

// test Pact.crpyto.hexToBin()
test('Takes in hex string and outputs Uint8Array binary object', function (t) {
  var hexKp = '8693e641ae2bbe9ea802c736f42027b03f86afe63cae315e7169c9c496c17332ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d'

  var actual = Pact.crypto.hexToBin(hexKp)
  var expected = new Uint8Array( [ 134, 147, 230,  65, 174,  43, 190, 158,
                                   168,   2, 199,  54, 244,  32,  39, 176,
                                    63, 134, 175, 230,  60, 174,  49,  94,
                                   113, 105, 201, 196, 150, 193, 115,  50,
                                   186,  84, 178,  36, 209, 146,  77, 217,
                                   132,   3, 245, 199,  81, 171, 221,  16,
                                   222, 108, 216,  27,   1,  33, 128,  11,
                                   247, 189, 189, 207, 174, 199,  56, 141 ])
  t.deepEqual(actual, expected);
  t.end();
});

// test Pact.crypto.base64UrlEncodeArr()
test('Takes in hashed Uint8Array binary object and outputs Base 64 URL encoded string', function (t) {
  var hshbin = new Uint8Array([  205, 170, 167,  69,  13,  17,  99,  60,
                                  83, 113, 200, 237,  98, 128, 111,  66,
                                 192, 232, 228, 175, 102, 198, 190,  19,
                                  16,  95, 135,  33, 132, 226, 228, 154
                               ])

  var actual = Pact.crypto.base64UrlEncodeArr(hshbin)
  var expected = "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo"

  t.equals(expected, actual);
  t.end();
});

// test Pact.crypto.hash()
test('Takes in hex string, outputs blake2b256 hashing encoded as unescaped base64url', function (t) {

  var actual = Pact.crypto.hash(JSON.stringify(cmd))
  var expected = "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8"

  t.equals(actual, expected);
  t.end();
});

// test Pact.crypto.sign()
test("Takes in cmd and keypair, returns object with hash and signature", function(t){

  var actual = Pact.crypto.sign(JSON.stringify(cmd), kp);
  var expected = {
   hash: 'uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8',
   sig: '4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03',
   pubKey: 'ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d'
 }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.crypto.signHash()
test("Takes in hash and keypair, returns object with hash and signature", function(t){

  var actual = Pact.crypto.signHash('uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8', kp);
  var expected = {
   hash: 'uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8',
   sig: '4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03',
   pubKey: 'ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d'
 }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.crypto.toTweetNaclSecretKey()
test("Takes in kp Object and returns secretkey in Uint8Array", function(t){
  var actual = Pact.crypto.toTweetNaclSecretKey(kp)
  var expected = new Uint8Array([ 134, 147, 230,  65, 174, 43,  190, 158,
                                  168,   2, 199,  54, 244, 32,   39, 176,
                                   63, 134, 175, 230,  60, 174,  49,  94,
                                  113, 105, 201, 196, 150, 193, 115,  50,
                                  186,  84, 178,  36, 209, 146,  77, 217,
                                  132,   3, 245, 199,  81, 171, 221,  16,
                                  222, 108, 216,  27,   1,  33, 128,  11,
                                  247, 189, 189, 207, 174, 199,  56, 141 ])

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.crypto.restoreKeyPairFromSecretKey()
test('Takes in a secretKey - hex of length 64 representing 32 byte Uint8Array binary object and outputs generated keypair object of secretKey and publicKey', function (t) {
  var secretKey = "53d1e1639bd6c607d33f3efcbaafc6d0d4fb022cd57a3a9b8534ddcd8c471902"
  var actual = Pact.crypto.restoreKeyPairFromSecretKey(secretKey)
  var expected = {
    publicKey: '85bef77ea3570387cac57da34938f246c7460dc533a67823f065823e327b2afd',
    secretKey: '53d1e1639bd6c607d33f3efcbaafc6d0d4fb022cd57a3a9b8534ddcd8c471902'
  }

  t.deepEqual(expected, actual);
  t.end();
});
