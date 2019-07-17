var test = require('tape');
var Pact = require("./../pact-lang-api.js")

//test Pact.lang.mkExp()
test('takes in arguments and returns LISP exp', function (t) {
  var actual = Pact.lang.mkExp("+", 2, 3)
  t.equals(actual, "(+ 2 3)");
  t.end();
});

//test Pact.lang.mkMeta()
test('takes in chain data and returns metadata in format', function (t) {
  var actual = Pact.lang.mkMeta("sender", "4", 10, 15)
  t.deepEqual(actual, { gasLimit: 15,
                chainId: '4',
                gasPrice: 10,
                sender: 'sender'
              });
  t.end();
});
