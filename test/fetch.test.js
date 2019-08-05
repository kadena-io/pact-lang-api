const test = require('blue-tape');
var Pact = require("./../pact-lang-api.js")
var test1 = require("./test-case1.js")

// Import Test Case
var { kp, cmd, nonce, pactCode, envData, meta } = require("./test-case1.js")

var apiHost = "http://localhost:9001"

// test Pact.fetch.send()
test("Make a send request and retrieve request key", async function(t) {
  var cmdObj = {
    keyPairs: kp,
    nonce: nonce,
    pactCode: pactCode,
    envData: envData,
    meta: meta
  }

  var actual = await Pact.fetch.send(cmdObj, apiHost);
  var expected = {
    requestKeys: ['zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo']
  }

  t.deepEqual(actual, expected);
})


// test Pact.fetch.local()
test("Make a local request and retrieve result", async function(t) {
  var cmdObj = {
    keyPairs: kp,
    nonce: nonce,
    pactCode: pactCode,
    envData: envData,
    meta: meta
  }

  var actual = await Pact.fetch.local(cmdObj, apiHost);
  var expected = {
    status: 'success',
    data: {
      time: '2017-10-31T12:00:00Z'
    }
  }

  t.deepEqual(actual, expected);
})

// test Pact.fetch.poll()
test("Make a poll request with a request key and retrieve result", async function(t) {
  var pollRq = { requestKeys: ["zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo"] }

  var actual = await Pact.fetch.poll(pollRq, apiHost);
  var expected = [{
    reqKey: 'zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo',
    result: {
      status: 'success',
      data: {
        time: '2017-10-31T12:00:00Z'
      }
    }
  }]

  t.deepEqual(actual, expected);
})

// test Pact.fetch.listen()
test("Make a listen request with a request key and retrieve result", async function(t) {
  var listenRq = { listen: "zaqnRQ0RYzxTccjtYoBvQsDo5K9mxr4TEF-HIYTi5Jo" }

  var actual = await Pact.fetch.listen(listenRq, apiHost);
  var expected = {
    status: 'success',
    data: {
      time: '2017-10-31T12:00:00Z'
    }
  }

  t.deepEqual(actual, expected);
})
