var test = require('tape');
var Pact = require("./../pact-lang-api.js")

// Import Test Case
var { kp, cmd, nonce, pactCode, envData, meta } = require("./test-case1.js")

// test Pact.simple.exec.createCommand()
test('Takes in Pact Command fields and outputs API request JSON for Send Request', function(t) {
  var actual = Pact.simple.exec.createCommand(kp, nonce, pactCode, envData, meta)
  var expected = {
    "cmds": [{
      "hash": "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo",
      "sigs": [{
        "sig": "6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a"
      }],
      "cmd": "{\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"addr\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\",\"scheme\":\"ED25519\",\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }

  t.deepEqual(actual, expected)
  t.end();
});

// test Pact.simple.exec.createLocalCommand()
test('Takes in Pact Command fields and outputs API request JSON for Local Request', function(t) {
  var actual = Pact.simple.exec.createLocalCommand(kp, nonce, pactCode, envData, meta)
  var expected = {
    "hash": "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo",
    "sigs": [{
      "sig": "6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a"
    }],
    "cmd": "{\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"addr\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\",\"scheme\":\"ED25519\",\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
  }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.simple.exec.createPollRequest()
test('Takes in Send Request JSON and outputs corresponding API request JSON for Poll request', function(t) {
  var execMsg = {
    "cmds": [{
      "hash": "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo",
      "sigs": [{
        "sig": "6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a"
      }],
      "cmd": "{\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"addr\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\",\"scheme\":\"ED25519\",\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }

  var actual = Pact.simple.exec.createPollRequest(execMsg)
  var expected = {
    requestKeys: ["zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo"]
  }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.simple.exec.createListenRequest()
test('Takes in Send Request JSON and outputs the API request JSON for Listen request of the first command', function(t) {
  var execMsg = {
    "cmds": [{
      "hash": "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo",
      "sigs": [{
        "sig": "6997a02e17ab6863bb9fe43200ae60c43fe4be278ff39e76887a33d7010ee2f15e6dfd4d0658c5e08ec3f397d1c1b37f15b01f613cedc49ce44e3714f789180a"
      }],
      "cmd": "{\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"addr\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\",\"scheme\":\"ED25519\",\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }

  var actual = Pact.simple.exec.createListenRequest(execMsg)
  var expected = {
    listen: "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo"
  }

  t.deepEqual(actual, expected)
  t.end()
})
