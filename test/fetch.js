const test = require('blue-tape');
var Pact = require("./../pact-lang-api.js")
const fetch = require("node-fetch");
var kp = {
  publicKey: '32be52d1f6dc4a1ed301408c346fb262d2b5a26843c82ba44cdaa468db4c7fad',
  secretKey: '5602a13905370adac5850575958fce81664f8935436d94ecef1e3aeebc9521c6'
}

// test Pact.fetch.send()
test("send request", async function(t){
  //expected, actual
  var apiHost = "http://localhost:9000"
  var sendCmd = {keyPairs: kp, pactCode:"()"}
  var actual = await Pact.fetch.send(sendCmd, apiHost);
  t.deepEqual(actual,  { requestKeys: [ 'nyTI_5p0o2UC9mbEPp2dURXGy5HcKzk2Qre6rnxuOzo' ] })
})


// test Pact.fetch.local()
test("local request", async function(t){
  //expected, actual
  var apiHost = "http://localhost:9000"
  var sendCmd = {keyPairs: kp, pactCode:"()"}
  var actual = await Pact.fetch.local(sendCmd, apiHost);
  t.deepEqual(actual, { status: 'failure', error: { callStack: [], type: 'SyntaxError', message: 'Unexpected end of input', info: '<interactive>:0:0' } })
})

// test Pact.fetch.poll()
test("poll request", async function(t){
  //expected, actual
  var apiHost = "http://localhost:9000"
  var pollRq = {requestKeys: []}
  var actual = await Pact.fetch.poll(sendCmd, apiHost);
  t.deepEqual(actual, [{ status: 'failure', error: { callStack: [], type: 'SyntaxError', message: 'Unexpected end of input', info: '<interactive>:0:0' } }])
})

// test Pact.fetch.listen()
test("listen request", async function(t){
  //expected, actual
  var apiHost = "http://localhost:9000"
  var rq = {listen: ""}
  var actual = await Pact.fetch.poll(sendCmd, apiHost);
  t.deepEqual(actual, { status: 'failure', error: { callStack: [], type: 'SyntaxError', message: 'Unexpected end of input', info: '<interactive>:0:0' } })
})
