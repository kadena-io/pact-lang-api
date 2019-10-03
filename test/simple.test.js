var test = require('tape');
var Pact = require("./../pact-lang-api.js")

// Import Test Case
var { kp, cmd, nonce, pactCode, envData } = require("./test-case1.js")

// test Pact.simple.exec.createCommand()
test('Takes in Pact Command fields and outputs API request JSON for Send Request', function(t) {
  var actual = Pact.simple.exec.createCommand(kp, nonce, pactCode, envData)
  var expected = {
    "cmds": [{
      "hash": "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8",
      "sigs": [{
        "sig": "4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03"
      }],
      "cmd":"{\"networkId\":null,\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"creationTime\":0,\"ttl\":0,\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }


  t.deepEqual(actual, expected)
  t.end();
});

// test Pact.simple.exec.createLocalCommand()
test('Takes in Pact Command fields and outputs API request JSON for Local Request', function(t) {
  var actual = Pact.simple.exec.createLocalCommand(kp, nonce, pactCode, envData)
  var expected = {
    "hash": "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8",
    "sigs": [{
      "sig": "4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03"
    }],
    "cmd":"{\"networkId\":null,\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"creationTime\":0,\"ttl\":0,\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
  }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.simple.exec.createPollRequest()
test('Takes in Send Request JSON and outputs corresponding API request JSON for Poll request', function(t) {
  var execMsg = {
    "cmds": [{
      "hash": "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8",
      "sigs": [{
        "sig": "4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03"
      }],
      "cmd":"{\"networkId\":null,\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"creationTime\":0,\"ttl\":0,\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }

  var actual = Pact.simple.exec.createPollRequest(execMsg)
  var expected = {
    requestKeys: ["uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8"]
  }

  t.deepEqual(actual, expected)
  t.end()
})

// test Pact.simple.exec.createListenRequest()
test('Takes in Send Request JSON and outputs the API request JSON for Listen request of the first command', function(t) {
  var execMsg = {
    "cmds": [{
      "hash": "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8",
      "sigs": [{
        "sig": "4b0ecfbb0e8f3cb291b57abd27028ceaa221950affa39f10efbf4a5fe740d32670e94c3d3949a7e5f4f6ea692052ca110f7cb2e9a8ee2c5eff4251ed84bbfa03"
      }],
      "cmd":"{\"networkId\":null,\"payload\":{\"exec\":{\"data\":{\"accounts-admin-keyset\":[\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"]},\"code\":\"(define-keyset 'k (read-keyset \\\"accounts-admin-keyset\\\"))\\n(module system 'k\\n  (defun get-system-time ()\\n    (time \\\"2017-10-31T12:00:00Z\\\")))\\n(get-system-time)\"}},\"signers\":[{\"pubKey\":\"ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d\"}],\"meta\":{\"creationTime\":0,\"ttl\":0,\"gasLimit\":0,\"chainId\":\"\",\"gasPrice\":0,\"sender\":\"\"},\"nonce\":\"\\\"step01\\\"\"}"
    }]
  }


  var actual = Pact.simple.exec.createListenRequest(execMsg)
  var expected = {
    listen: "uolsidh4DWN-D44FoElnosL8e5-cGCGn_0l2Nct5mq8"
  }

  t.deepEqual(actual, expected)
  t.end()
})
