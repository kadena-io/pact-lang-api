//Test Case 1 - 01-system.yaml code from https://github.com/kadena-io/pact/blob/master/examples/accounts/scripts/01-system.yaml
var kp = {
  publicKey: 'ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d',
  secretKey: '8693e641ae2bbe9ea802c736f42027b03f86afe63cae315e7169c9c496c17332'
}
var nonce = "step01"
var pactCode = "(define-keyset 'k (read-keyset \"accounts-admin-keyset\"))\n(module system \'k\n  (defun get-system-time ()\n    (time \"2017-10-31T12:00:00Z\")))\n(get-system-time)"
var envData = {
  "accounts-admin-keyset": ["ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"]
}
var meta = {
  "gasLimit": 0,
  "chainId": "",
  "gasPrice": 0,
  "sender": ""
}
var cmd = {
  payload: {
    exec: {
      data: envData,
      code: pactCode
    }
  },
  signers: [{
    "addr": "ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d",
    "scheme": "ED25519",
    "pubKey": "ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d"
  }],
  meta,
  nonce: JSON.stringify(nonce)
}

module.exports = {
  cmd: cmd,
  kp: kp,
  nonce: nonce,
  pactCode: pactCode,
  meta: meta,
  envData: envData
}
