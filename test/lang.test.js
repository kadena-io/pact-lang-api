var test = require('tape');
var Pact = require("./../pact-lang-api.js")

//test Pact.lang.mkExp()
test('Takes in Pact function and arguments and outputs Pact code', function(t) {
  var actual = Pact.lang.mkExp("+", 2, 3)
  var expected = "(+ 2 3)"

  t.equals(actual, expected);
  t.end();
});

//test Pact.lang.mkMeta()
test('Takes in meta data and outputs meta object format', function(t) {
  var actual = Pact.lang.mkMeta("Bob", "4", 10, 15)
  var expected = {
    gasLimit: 15,
    chainId: '4',
    gasPrice: 10,
    sender: 'Bob'
  }

  t.deepEqual(actual, expected);
  t.end();
});
