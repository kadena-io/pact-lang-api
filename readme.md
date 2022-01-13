# Pact Smart Contract Language API JavaScript wrappers

This package is here to help make interaction with both Pact's development server & a ScalableBFT cluster running Pact easy.
The API's for each are the same. For information about Pact & ScalableBFT please see [kadena.io](kadena.io) or [github.com/kadena-io/pact](github.com/kadena-io/pact).

For example usage, see [github.com/kadena-io/pact-todomvc](github.com/kadena-io/pact-todomvc)

## Import

`pact-lang-api.js` should work as expected as a regular node dependency.

`<script src="https://cdn.jsdelivr.net/npm/pact-lang-api@4.1.2/pact-lang-api-global.min.js"></script>` will import the library and inject it as a top-level definition called `Pact`

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

Restoring a key pair from secret key.
```
Pact.crypto.restoreKeyPairFromSecretKey(secretKey) -> {"publicKey": <string>, "secretKey": <string>}
```

### Language Expression Construction

A helper function for constructing native Pact commands.
- `mkExp` takes in Pact function and its arguments and returns a Pact expression.
- `mkMeta` returns meta information of the tx in object format. This is only important for the txs in public blockchain. txs don't need a meta field in private blockchain.
   * "sender" represents the gas account, and the tx must be signed with the keyset associated with the gas account. Otherwise, the tx will be rejected.
   * "chainId" represents the chain Id that the tx will be sent to.
   * "gasPrice" represents the gas price of the tx.
   * "gasLimit" represents the gas limit of the tx.
   * "creationTime" represents the tx's wait time to be considered a candidate for inclusion into a block in the blockchain. (in seconds)
   * "ttl" represents the tx's maximum wait time to be considered a candidate for inclusion into a block in the blockchain. (in seconds)
- `mkCap` prepares a capability object to be signed with keyPairs using signing API.

```
Pact.lang.mkExp(<function:string>, *args) -> <string>
  ex: mkExp("todos.edit-todo", 1, "bar")
    -> '(todos.edit-todo 1 "bar")'

Pact.lang.mkMeta(<sender:string> , <chainId:string>, <gasPrice: number>, <gasLimit: number>, <creationTime: number>, <ttl: number>) -> <meta: object>
  ex: mkMeta("Bob", "1", 0.0001, 100, 0, 28800)
    -> { "sender": "Bob", "chainId": "1", "gasPrice": 0.0001, "gasLimit": 100, "creationTime": 0, "ttl": 28800 }

Pact.lang.mkCap(<role:string> , <description:string>, <name: string>, <args: object>) -> <cap: object>
  ex: mkCap("Coin Transfer", "Capability to transfer designated amount of coin from sender to receiver", "coin.TRANSFER", ["Bob", "Kate", 10])
    -> {
          "role": "Coin Transfer",
          "description": "Capability to transfer designated amount of coin from sender to receiver",
          "cap": {
            "name": "coin.TRANSFER",
            "args": ["Bob", "Kate", 10]
          }
       }
```

NB: `JSON.stringify`, which is used here, generally converts floating point numbers correctly but fails for high precision scientific numbers < 0; you will need to manually convert them.
e.g. `JSON.stringify(.0000001) -> '1e-7'` is incorrect as Pact has infinite precision decimals but does not interpret scientific numbers, so the proper conversion would be `JSON.stringify(.0000001) -> '0.0000001'`



### Simple API Fetch

Simple fetch functions to make API request to a running Pact Server and retrieve the results.

```
/**
 * An execCmd Object to Execute at /send or /local endpoint.
 * @typedef {Object} execCmd
 * @property type {string} - type of command - "cont" or "exec", default to "exec"
 * @property pactCode {string} - pact code to execute in "exec" command - required for "exec"
 * @property nonce {string} - nonce value to ensure unique hash - default to current time
 * @property envData {object} - JSON of data in command - not required
 * @property meta {object} - public meta information, see mkMeta
 * @property networkId {string} network identifier of where the cmd is executed.
 */
```
```
/**
 * A contCmd to Execute at /send endpoint
 * @typedef {Object} contCmd
 * @property type {string} - type of command - "cont" or "exec", default to "exec"
 * @property pactId {string} - pactId the cont command - required for "cont"
 * @property nonce {string} - nonce value to ensure unique hash - default to current time
 * @property step {number} - the step of the mutli-step transaction - required for "cont"
 * @property proof {string} - JSON of SPV proof, required for cross-chain transfer. See `fetchSPV` below
 * @property rollback {bool} - Indicates if this continuation is a rollback/cancel - required for "cont"
 * @property envData {object} - JSON of data in command - not required
 * @property meta {object} - public meta information, see mkMeta
 * @property networkId {string} network identifier of where the cmd is executed.
 */
```
```
## Make API request to execute a command or commands in the public server and retrieve request keys of the txs.

Pact.fetch.send([<execCmd:object> or <contCmd:object>], <apiHost:string>) -> {"requestKeys": [...]}

  ex:
    const cmds = [
                  // create an account with single-sig keyset
                  {
                     keyPairs: KEY_PAIR,
                     pactCode: "(coin.create-account 'account-1 (read-keyset 'account-keyset))",
                     envData: {
                       "account-keyset": ["368820f80c324bbc7c2b0610688a7da43e39f91d118732671cd9c7500ff43cca"],
                     }
                  },
                  // create an account with multi-sig keyset
                  {
                    keyPairs: KEY_PAIR,
                    pactCode: "(coin.create-account 'account2 (read-keyset 'account-keyset))",
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
        pactCode: `(coin.details 'account1)`
      };

    Pact.fetch.local(cmd, API_HOST)

    // Returns the following as a Promise Value
    { gas: 0,
      result: { status: 'success', data: 'Write succeeded' },
      reqKey: 'ZWsF84CuKVq4qxjFrgbBr15EHbhKxaeAP6S6qRTWkmY',
      logs: 'wsATyGqckuIvlm89hhd2j4t6RMkCrcwJe_oeCYr7Th8',
      metaData:
       { publicMeta:
          { creationTime: 1574809666,
            ttl: 28800,
            gasLimit: 10000,
            chainId: '0',
            gasPrice: 1e-9,
            sender: 'sender00' },
         blockTime: 0,
         prevBlockHash: '',
         blockHeight: 0 },
      continuation: null,
      txId: null }
```
```
## Make API request to retrieve result of a tx or multiple tx's with request keys.
Pact.fetch.poll({requestKeys: ["..."]}, <apiHost:string>) -> {result}

  ex:
    const cmd = { requestKeys: [ "6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE",
                                 "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0" ]}

    Pact.fetch.poll(cmd, API_HOST)

    // Returns the following as a Promise Value
    { 6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE:
        { gas: 6296,
          result: { status: 'success', data: 'Write succeeded' },
          reqKey: '6ue-lrwXaLcDyxDwJ1nuLzOfFtnQ2TaF0_Or_X0KnbE',
          logs: 'IVz-tGIp3TwibAqlq6UGt4yFiJ-d9sqvcbWVTEs_e68',
          metaData: null,
          continuation: null,
          txId: 702717 },
      P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0:
        { gas: 6296,
          result: { status: 'success', data: 'Write succeeded' },
          reqKey: 'P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0',
          logs: 'sSDqe9W36P43WEUfdyBRB7m-t0qQZjVRtu5jdElfMzgs',
          metaData: null,
          continuation: null,
          txId: 702717 }
      }
```
```
## Make API request to retrieve result of a tx with a request key.
Pact.fetch.listen({listen: "..."}, <apiHost:string>) -> {status: "...", data: "..."}

  ex:
    const cmd = { listen: "P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0" }

    Pact.fetch.listen(cmd, API_HOST)

    // Returns the following as a Promise Value
    { gas: 6296,
      result: { status: 'success', data: 'Write succeeded' },
      reqKey: 'P7qDsrt3evfEjtlQAW_b1ZPS7LpAZynCO8wx99hc5i0',
      logs: 'IVz-tGIp3TwibAqlq6UGt4yFiJ-d9sqvcbWVTEs_e68',
      metaData: null,
      continuation: null,
      txId: 702717 }
```
```
/**
 * A SPV Command Object to Execute at /spv endpoint.
 * @typedef {Object} spvCmd
 * @property requestKey {string} pactId of the SPV transaction
 * @property targetChainId {string} chainId of target chain of SPV transaction
 */
```
```
## Make API request to retrieve proof of SPV request.
Pact.fetch.spv([<spvCmd:object>], <apiHost:string>) -> "[proof base64url value]"

   ex:
     const cmd = { requestKey: "CzZzVpxdQHiL7tmqNnAeCB0qX-nXyqFYAystzNlrBhw",
                   targetChainId: "1" }

     Pact.fetch.spv(cmd, API_HOST)

     // Returns the following as a Promise Value
     [proof base64url value]

```

### Chainweaver Signing API Command

Simple functions to interact with Chainweaver wallet (https://github.com/kadena-io/chainweaver) and its signing API.

```
* A signingCmd Object to send to signing API
* @typedef {Object} signingCmd - cmd to send to signing API
* @property pactCode {string} - Pact code to execute - required
* @property caps {array or object} - Pact capability to be signed, see mkCap - required
* @property envData {object} - JSON of data in command - optional
* @property sender {string} - sender field in meta, see mkMeta - optional
* @property chainId {string} - chainId field in meta, see mkMeta - optional
* @property gasLimit {number} - gasLimit field in meta, see mkMeta - optional
* @property gasPrice {string} - gasPrice field in meta, see mkMeta - optional
* @property signingPubKey {string} - public key of the signer - optional
* @property networkId {string} - network identifier of where the cmd is executed - optional
* @property nonce {string} - nonce value for ensuring unique hash - optional
**/
```

```
## Sends parameters of Pact Command to the Chainweaver signing API and retrieves a signed Pact Command.
Pact.wallet.sign(<signingCmd:object>) -> {<execCmd:object>}

## Sends a signed Pact ExecCmd to a running Pact server and retrieves tx result.
Pact.wallet.sendSigned(<execCmd:object>, <apiHost:string>) -> {"requestKeys": [...]}
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

### Events

Events from transaction outputs are flattened into a single array or stream. Each item contains a height property that indicates the block height at which it occurred.

##### Example of an event object:

```
{
  params: [
    '4677a09ea1602e4e09fe01eb1196cf47c0f44aa44aac903d5f61be7da3425128',
    'f6357785d8b147c1fac66cdbd607a0b1208d62996d7d62cc92856d0ab229bea2',
    10462.28
  ],
  name: 'TRANSFER',
  module: { namespace: null, name: 'coin' },
  moduleHash: 'ut_J_ZNkoyaPUEJhiwVeWnkSQn9JT9sQCWKdjjVVrWo',
  height: 1511601
}
```
##### Event Function Parameters
```
/**
 * @param {number|string} chainId - a chain id that is valid for the network
 * @param {number[]} chainIds - array of chain ids
 * @param {number} depth - confirmation depth. Only blocks at this depth are returned
 * @param {string} blockHash - block hash
 * @param {number} blockHeight - block height
 * @param {number} start - start block height
 * @param {number} end - end block height
 * @param {number} n - maximual number of blocks from which events are returned. The actual number of returned events may be lower.
 * @param {eventCallback} callback - function that is called for each event
 * @param {string} [network="mainnet01"] - chainweb network
 * @param {string} [host="https://api.chainweb.com"] - chainweb api host
 ```
#### Events By Height

```javascript
Pact.event.height(chainId, blockHeight, network, host)
```


#### Events By Block Hash

```javascript
Pact.event.blockHash(chainId, blockHash, network, host)
```

#### Recent Events

These functions return items from recent blocks in the block history starting
at a given depth.

The depth parameter is useful to avoid receiving items from orphaned blocks.

```javascript
Pact.event.recent(chainId, depth, n, network, host)
```

#### Range of Events

These functions query events from a range of block heights and return the
result as an array.

```javascript
Pact.event.range(chainId, start, end, network, host)
```


#### Event Stream

Streams are backed by EventSource clients that retrieve header update
events from the Chainweb API.

```javascript
const es = Pact.event.stream(depth, chainIdS, callback, network, host);
```

Streams are online and only return items from blocks that got mined after the
stream was started. They are thus useful for prompt notification of new
items. In order of exhaustively querying all, including old, items, one
should also use `range` or `recent` queries for the respective type of item.
