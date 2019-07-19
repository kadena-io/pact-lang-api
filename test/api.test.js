var test = require('tape');
var Pact = require("./../pact-lang-api.js")

// Import Test Case
var { kp, cmd, nonce, pactCode, envData, meta } = require("./test-case1.js")

// test Pact.api.prepareExecCmd()
test('Takes in Pact Command fields and outputs signed prepareExecCmd Object', function(t) {
  var actual = Pact.api.prepareExecCmd(kp, nonce, pactCode, envData, meta)
  var expected = {
    hash: 'zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo',
    sigs: [{
      sig: '6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a'
    }],
    cmd: '{"payload":{"exec":{"data":{"accounts-admin-keyset":["ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"]},"code":"(define-keyset \'k (read-keyset \\"accounts-admin-keyset\\"))\\n(module system \'k\\n  (defun get-system-time ()\\n    (time \\"2017-10-31T12:00:00Z\\")))\\n(get-system-time)"}},"signers":[{"addr":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d","scheme":"ED25519","pubKey":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"}],"meta":{"gasLimit":0,"chainId":"","gasPrice":0,"sender":""},"nonce":"\\"step01\\""}'
  }
  t.deepEqual(actual, expected);
  t.end();
});

// test Pact.api.mkSingleCmd()
test('Takes in sign object and cmd object and outputs singleCmd formatted for API requests', function(t) {
  var sign = [{
    hash: 'zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo',
    sig: '6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a',
    pubKey: 'ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d'
  }]

  var actual = Pact.api.mkSingleCmd(sign, JSON.stringify(cmd))
  var expected = {
    hash: 'zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo',
    sigs: [{
      sig: '6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a'
    }],
    cmd: '{"payload":{"exec":{"data":{"accounts-admin-keyset":["ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"]},"code":"(define-keyset \'k (read-keyset \\"accounts-admin-keyset\\"))\\n(module system \'k\\n  (defun get-system-time ()\\n    (time \\"2017-10-31T12:00:00Z\\")))\\n(get-system-time)"}},"signers":[{"addr":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d","scheme":"ED25519","pubKey":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"}],"meta":{"gasLimit":0,"chainId":"","gasPrice":0,"sender":""},"nonce":"\\"step01\\""}'
  }

  t.deepEqual(actual, expected);
  t.end();
});

// test Pact.api.mkPublicSend()
test('Takes in singleCmd object and outputs mkPublicSend formatted specifically for a send request', function(t) {
  var singleCmd = {
    hash: 'zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo',
    sigs: [{
      sig: '6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a'
    }],
    cmd: '{"payload":{"exec":{"data":{"accounts-admin-keyset":["ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"]},"code":"(define-keyset \'k (read-keyset \\"accounts-admin-keyset\\"))\\n(module system \'k\\n  (defun get-system-time ()\\n    (time \\"2017-10-31T12:00:00Z\\")))\\n(get-system-time)"}},"signers":[{"addr":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d","scheme":"ED25519","pubKey":"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"}],"meta":{"gasLimit":0,"chainId":"","gasPrice":0,"sender":""},"nonce":"\\"step01\\""}'
  }

  var actual = Pact.api.mkPublicSend(singleCmd)
  var expected = {
    cmds: [singleCmd]
  };
  t.deepEqual(actual, expected);
  t.end();
});
