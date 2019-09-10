# Pact Smart Contract Language API JavaScript wrappers

This package is here to help make interaction with both Pact's development server & a ScalableBFT cluster running Pact easy.
The API's for each are the same. For information about Pact & ScalableBFT please see [kadena.io](kadena.io) or [github.com/kadena-io/pact](github.com/kadena-io/pact).

For example usage, see [github.com/kadena-io/pact-todomvc](github.com/kadena-io/pact-todomvc)

## Import

`pact-lang-api.js` should work as expected as a regular node dependency.

`<script src="pact-lang-api-global.min.js"></script>` will import the library and inject it as a top-level definition called `Pact`

## Functions

### Crypto

Converting between binary & hex formats:

```
Pact.crypto.binToHex(<Uint8Array>) -> string
Pact.crypto.hexToBin(string) -> Uint8Array
```

Hashing (blake2b):

```
Pact.crypto.hash(string) -> string
```

PPK Signing is done via TweetNacl but with ed25519-donna style keys, represented as hex.
blake2b is used to hash the message (<string>), and TweetNacl then signs the hash.

```
Pact.crypto.genKeyPair() -> {"publicKey": <string>, "secretKey": <string>}
Pact.crypto.sign(<string>, keyPair) -> {"hash": <string>, "sig":<string>, "pubKey":<string>}
Pact.crypto.toTweetNaclSecretKey(keyPair) -> <Uint8Array>
```

### Language Expression Construction

A helper function for constructing native Pact commands.
- mkExp takes in Pact function and its arguments and returns a Pact expression.
- mkMeta returns gas information of the tx in object format. This is only important for the txs in public blockchain. txs don't need gas in private blockchain.
   * "sender" represents the gas account, and the tx must be signed with the keyset associated with the gas account. Otherwise, the tx will be rejected.
   * "ChainId" represents the Chain Id that the tx will be sent to.
   * "gasPrice" represents the gas price of the tx.
   * "gasLimit" represents the gas limit of the tx.
   * "creationTime" represents the creation time of the tx (0 refers to current time).
   * "ttl" represents the tx's time to live on chain. (in seconds)
```
Pact.lang.mkExp(<function:string>, *args) -> <string>
  ex: mkExp("todos.edit-todo", 1, "bar") -> '(todos.edit-todo 1 "bar")'

Pact.lang.mkMeta(<sender:string> , <chainId:string>, <gasPrice: number>, <gasLimit: number>, <creationTime: number>, <ttl: number>) -> <meta: object>
  ex: mkMeta("Bob", "1", 0.0001, 100, 0, 28800) -> { "sender": "Bob", "ChainId": "1", "gasPrice": 0.0001, "gasLimit": 100, "creationTime": 0, "ttl": 28800 }
```

NB: `JSON.stringify`, which is used here, generally converts floating point numbers correctly but fails for high precision scientific numbers < 0; you will need to manually convert them.
e.g. `JSON.stringify(.0000001) -> '1e-7'` is incorrect as Pact has infinite precision decimals but does not interpret scientific numbers, so the proper conversion would be `JSON.stringify(.0000001) -> '0.0000001'`



### Simple API Fetch

Simple fetch functions to make API request to a running Pact Server and retrieve the results.

```
* A Command Object to Execute in send or local.
* @typedef {Object} execCmd
* @property pactCode {string} - pact code to execute
* @property keyPairs {array or object} - array or single ED25519 keypair
* @property nonce {string} - nonce value, default at current time
* @property envData {object} - JSON message data including keyset information, default at empty obj
* @property meta {object} - meta information, see mkMeta
*/
```
```
## Make API request to execute a command or commands in the public server and retrieve request keys of the txs.

Pact.fetch.send([<execCmd:object>], <apiHost:string>) -> {"requestKeys": [...]}

  ex:
    const cmds = [
                  // create an account with single-sig keyset
                  {
                     keyPairs: KEY_PAIR,
                     pactCode: "(accounts.create-account 'account-1 (read-keyset 'account-keyset))",
                     envData: {
                       "account-keyset": ["368820f80c324bbc7c2b0610688a7da43e39f91d118732671cd9c7500ff43cca"],
                     }
                  },
                  // create an account with multi-sig keyset
                  {
                    keyPairs: KEY_PAIR,
                    pactCode: "(accounts.create-account 'account2 (read-keyset 'account-keyset))",
                    envData: {
                      "account-keyset": {
                        "keys": [
                          "2d70aa4f697c3a3b8dd6d97745ac074edcfd0eb65c37774cde25135483bea71e",
                          "4c31dc9ee7f24177f78b6f518012a208326e2af1f37bb0a2405b5056d0cad628"
                        ],
                        "pred": "keys-any"
                      }
                    }
                  }
                 ]

    Pact.fetch.send(cmds, API_HOST)

    // Returns the following as a Promise Value
    { "requestKeys": [ "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
                     "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0" ]}
```
```
## Make API request to execute a single command in the local server and retrieve the result of the tx. (Used to execute commands that read DB)
Pact.fetch.local(<execCmd:object>, <apiHost:string>) -> {result}

  ex:     
    const cmd = {
        keyPairs: KEY_PAIR,
        pactCode: `(accounts.read-account 'account1)`
      };

    Pact.fetch.local(cmd, API_HOST)

    // Returns the following as a Promise Value
    { "status": "success",
      "data": {
        "keyset": {
           "pred": "keys-all",
           "keys": ["368820f80c324bbc7c2b0610688a7da43e39f91d118732671cd9c7500ff43cca"]
        },
        "balance": 0.0
      }
    }
```
```
## Make API request to retrieve result of a tx or multiple tx's with request keys.
Pact.fetch.poll({requestKeys: ["..."]}, <apiHost:string>) -> [{requestKey: "...", result: {...}}, ...]

  ex:
    const cmd = { requestKeys: [ "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
                                 "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0" ]}

    Pact.fetch.poll(cmd, API_HOST)

    // Returns the following as a Promise Value
    [{ "reqKey": "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
       "result": {
         "status": "success",
         "data": "Write succeeded"
       }
     },
     { "reqKey": "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0",
       "result": {
         "status": "success",
         "data": "Write succeeded"
       }
     }]
```
```
## Make API request to retrieve result of a tx with a request key.
Pact.fetch.listen({listen: "..."}, <apiHost:string>) -> {status: "...", data: "..."}

  ex:
    const cmd = { listen: "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE" }

    Pact.fetch.listen(cmd, API_HOST)

    // Returns the following as a Promise Value
    { "status": "success",
      "data": "Write succeeded" }
```


### Simple API Command

A simplified set of functions for working with the api.

```
## Creates a command to send as POST to /api/send
Pact.simple.exec.createCommand([keyPair], <nonce: string>, <pactCode: string>, <envData: object>) -> {"cmds":[...]}

## Creates a command to send as POST to /api/local
Pact.simple.exec.createLocalRequest([keyPair], <nonce: string>, <pactCode: string>, <envData: object>) -> {"hash": "...", sigs: [...], cmd: {...} }

## Creates a command to send as POST to /api/poll
Pact.simple.exec.createPollRequest({"cmds": [...]}) -> {"requestKeys": [...]}

## Creates a command to send as POST to /api/listen
Pact.simple.exec.createListenRequest({"cmds": [...]}) -> {"listen": <string>}
```

### Low Level API

Lower level/internal functions to aid in the construction of JSON blobs that the API endpoints expect.
You probably want to use the `Pact.simple` functions instead of these.

```
Pact.api.mkSingleCmd([signatures],{cmd-object}) -> {"hash":<string>, "sigs":[signatures], "cmd":cmd}
Pact.api.mkPublicSend([cmd]) -> {"cmds":[cmd]} \\ send as POST to /api/poll
```
