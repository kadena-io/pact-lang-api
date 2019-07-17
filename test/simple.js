var test = require('tape');
var Pact = require("./../pact-lang-api.js")
var kp = {
  publicKey: '4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760',
  secretKey: 'a7790377741ab65cbb29e27ac25fa57c86b84c4b16c7cad01d5028fd127a6f36'
}

// test Pact.simple.exec.createCommand()
test('takes in cmd arguments and returns exec command', function (t) {
  var nonce = "nonce"
  var pactCode = "()"
  var envData = {}
  var meta = {}
  var actual = Pact.simple.exec.createCommand(kp, nonce, pactCode, envData, meta)
  t.deepEqual(actual, { cmds: [ {
                          hash: 'Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0',
                          sigs: [{ sig: '0c6deef530c39fc5ce3ec8f455fd862b103494c436b2f381389b278de1dd3696f58416ff272242689b799ff76d68100f95ab921f11c648a45e933c009c844009' }],
                          cmd: '{"nonce":"nonce","payload":{"exec":{"code":"()","data":{}}},"signers":[{"pubKey":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","addr":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","scheme":"ED25519"}],"meta":{}}'
                        }]})
  t.end();
});

// test Pact.simple.exec.createLocalCommand()
test('takes in cmd arguments and returns local exec command', function (t) {
  var nonce = "nonce"
  var pactCode = "()"
  var envData = {}
  var meta = {}
  var actual = Pact.simple.exec.createLocalCommand(kp, nonce, pactCode, envData, meta)
  t.deepEqual(actual, {
      hash: 'Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0',
      sigs: [
        {
          sig: '0c6deef530c39fc5ce3ec8f455fd862b103494c436b2f381389b278de1dd3696f58416ff272242689b799ff76d68100f95ab921f11c648a45e933c009c844009'
        }
      ],
      cmd: '{"nonce":"nonce","payload":{"exec":{"code":"()","data":{}}},"signers":[{"pubKey":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","addr":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","scheme":"ED25519"}],"meta":{}}'
    })
  t.end()
})

// test Pact.simple.exec.createPollRequest()
test('takes in execMsg and returns poll request format', function (t) {
  var execMsg = {
    cmds: [
      {
        hash: 'Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0',
        sigs: [{ sig: '0c6deef530c39fc5ce3ec8f455fd862b103494c436b2f381389b278de1dd3696f58416ff272242689b799ff76d68100f95ab921f11c648a45e933c009c844009' }],
        cmd: '{"nonce":"nonce","payload":{"exec":{"code":"()","data":{}}},"signers":[{"pubKey":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","addr":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","scheme":"ED25519"}],"meta":{}}'
      }]}
  var actual = Pact.simple.exec.createPollRequest(execMsg)
  t.deepEqual(actual, { requestKeys:["Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0"] })
  t.end()
})

// test Pact.simple.exec.createListenRequest()
test('takes in execMsg and returns listen request format', function (t) {
  var execMsg = {
    cmds: [
      {
        hash: 'Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0',
        sigs: [{ sig: '0c6deef530c39fc5ce3ec8f455fd862b103494c436b2f381389b278de1dd3696f58416ff272242689b799ff76d68100f95ab921f11c648a45e933c009c844009' }],
        cmd: '{"nonce":"nonce","payload":{"exec":{"code":"()","data":{}}},"signers":[{"pubKey":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","addr":"4ca99177a3ac949747edb95ca85e6ab378ead22a472cb879e617271485c72760","scheme":"ED25519"}],"meta":{}}'
      }]}
  var actual = Pact.simple.exec.createListenRequest(execMsg)
  t.deepEqual(actual, { listen:"Fh-wT_dtzkWQmNC5F_G0VmxZlhRazby6_uL5QiwfaS0" })
  t.end()
})
