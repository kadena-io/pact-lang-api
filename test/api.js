var test = require('tape');
var Pact = require("./../pact-lang-api.js")
var kp = {
  publicKey: '32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad',
  secretKey: '5602a13905370adac5850575958fce81664f8935436d94ecef1e3aeebc9521c6'
}

// test Pact.api.prepareExecCmd()
test('testing prepareExecCmd ouputs', function (t) {
  var cmd = {
    nonce: "nonce",
    payload: {
      exec: {
        code: "(+ 1 2)",
        data: "data"
      }
    },
    signers:[{"pubKey":"32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad","addr":"32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad","scheme":"ED25519"}],
    meta: "meta" }
    var actual = Pact.api.prepareExecCmd(kp, "nonce", "(+ 1 2)", "data", "meta")
    t.deepEqual(actual, { hash: "lh2gqZKS7hK16CmetMQOQ53aaPPSJHs1UsNHyh78Q1E",
                          sigs: [{sig: "dcc3bee6c4c59e7f831f5972e84af20647310a7fcdc0d14c88b64673c2116f5738bae9fa2c885df3e5bc76f9b8690a4bb09008e00e1be05024e0fd9f3d07e101"}],
                          cmd: JSON.stringify(cmd) });
    t.end();
});

// test Pact.api.mkSingleCmd()
test('testing singleCmd ouputs', function (t) {
  var cmd = {
    nonce: "nonce",
    payload: {
      exec: {
        code: "(+ 1 2)",
        data: "data"
      }
    },
    signers:[{"pubKey":"32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad","addr":"32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad","scheme":"ED25519"}],
    meta: "meta"}

  var sign = [{hash:"hash", sig:"sig"}]

  var actual = Pact.api.mkSingleCmd(sign, JSON.stringify(cmd))

  t.deepEqual(actual, { hash: "hash",
                        sigs: [{sig: "sig"}],
                        cmd: JSON.stringify(cmd) });
  t.end();
});

// test Pact.api.mkPublicSend()

test('testing mkPublicSend ouputs', function (t) {
  var cmd = {cmd: {"exec": "exec"}}
  var actual = Pact.api.mkPublicSend(cmd)
  t.deepEqual(actual, {cmds: [cmd]});
  t.end();
});
