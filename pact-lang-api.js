/** pact-lang-api.js
 * Exports functions to support Pact API calls.
 * Author: Will Martino, Hee Kyun Yun, Stuart Popejoy
 * Supports: Pact API 3.0 v1
 */

const blake = require("blakejs");
const nacl = require("tweetnacl");
const fetch = require("node-fetch");
const chainweb = require("chainweb");

/**
 * Convert binary to hex.
 * @param s {Uint8Array} - binary value
 * @return {string} hex string
 */
var binToHex = function(s) {
  var constructor = s.constructor.name || null;

  if (constructor !== "Uint8Array") {
    throw new TypeError("Expected Uint8Array");
  }

  return Buffer.from(s).toString("hex");
};

/**
 * Convert hex string to binary.
 * @param s {string} - hex string
 * @return {Uint8Array} binary value
 */
var hexToBin = function(h) {
  if (typeof h !== "string") {
    throw new TypeError("Expected string: " + h);
  }
  return new Uint8Array(Buffer.from(h, "hex"));
};

b64url = (function() {

  'use strict';

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error ();
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  function base64UrlEncode(input) {
    var str = String (input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      // str.charAt (idx | 0) || (map = '=', idx % 1);
      str.charAt (idx | 0);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt (63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt (idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError ("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  function base64UrlDecode(input) {
    var str = (String (input)).replace (/[=]+$/, ''); // #31: ExtendScript bad parse of /=
    if (str.length % 4 === 1) {
      throw new InvalidCharacterError ("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt (idx++); // eslint-disable-line no-cond-assign
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode (255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf (buffer);
    }
    return output;
  }

  return {encode: base64UrlEncode, decode: base64UrlDecode};

})();

function strToUint8Array(s) {
    var i, b = new Uint8Array(s.length);
    for (i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
}

function uint8ArrayToStr(a) {
    return String.fromCharCode.apply(null, new Uint16Array(a));
}

function b64urlDecodeArr(input) {
    return strToUint8Array(b64url.decode(input));
}

function b64urlEncodeArr(input) {
    return b64url.encode(uint8ArrayToStr(input));
}

/**
 * Perform blake2b256 hashing.
 */
var hashBin = function(s) {
  return blake.blake2b(s, null, 32);
};

/**
 * Perform blake2b256 hashing, encoded as unescaped base64url.
 */
var hash = function(s) {
  return b64urlEncodeArr(hashBin(s));
};

/**
 * Generate a random ED25519 keypair.
 * @return {object} with "publicKey" and "secretKey" fields.
 */
var genKeyPair = function() {
  var kp = nacl.sign.keyPair();
  var pubKey = binToHex(kp.publicKey);
  var secKey = binToHex(kp.secretKey).slice(0, 64);
  return { publicKey: pubKey, secretKey: secKey };
};

/**
 * Generate a deterministic ED25519 keypair from a given Kadena secretKey
 * @return {object} with "publicKey" and "secretKey" fields.
 */
var restoreKeyPairFromSecretKey = function(seed) {
  if (!seed)  throw new Error(`seed for KeyPair generation not provided`);
  if (seed.length !== 64) throw new Error('Seed for KeyPair generation has bad size');
  var seedForNacl = hexToBin(seed);
  var kp = nacl.sign.keyPair.fromSeed(seedForNacl);
  var pubKey = binToHex(kp.publicKey);
  var secKey = binToHex(kp.secretKey).slice(0, 64);
  return { publicKey: pubKey, secretKey: secKey };
};

var toTweetNaclSecretKey = function(keyPair) {
  if (
    !keyPair.hasOwnProperty("publicKey") ||
    !keyPair.hasOwnProperty("secretKey")
  ) {
    throw new TypeError(
      "Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': " +
        JSON.stringify(keyPair)
    );
  }
  return hexToBin(keyPair.secretKey + keyPair.publicKey);
};

/**
 * Attach signature to hashed data
 * @param msg - some data to be passed to blake2b256.
 * @param keyPair - signing ED25519 keypair
 * @return {Array} of "hash", "sig" (signature in hex format), and "pubKey" public key values.
 */
var attachSig = function(msg, kpArray) {
  var hshBin = hashBin(msg);
  var hsh = b64urlEncodeArr(hshBin);
  if (kpArray.length === 0 ) {
   return [{hash: hsh, sig: undefined}];
  } else {
    return kpArray.map(kp => {
      if (
        (kp.hasOwnProperty("publicKey") && kp.publicKey) &&
        (kp.hasOwnProperty("secretKey") && kp.secretKey)) {
        return sign(msg, kp);
      } else {
        return {
          hash: hsh,
          sig: undefined,
          publicKey: kp.publicKey
        };
      }
    })
  }
};

/**
 * Sign data using key pair.
 * @param msg - some data to be passed to blake2b256.
 * @param keyPair - signing ED25519 keypair
 * @return {object} with "hash", "sig" (signature in hex format), and "pubKey" public key value.
 */
var sign = function(msg, keyPair) {
  if (
    !keyPair.hasOwnProperty("publicKey") ||
    !keyPair.hasOwnProperty("secretKey")
  ) {
    throw new TypeError(
      "Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': " +
        JSON.stringify(keyPair)
    );
  }
  var hshBin = hashBin(msg);
  var hsh = b64urlEncodeArr(hshBin);
  var sigBin = nacl.sign.detached(hshBin, toTweetNaclSecretKey(keyPair));
  return { hash: hsh, sig: binToHex(sigBin), pubKey: keyPair.publicKey };
};

/**
 * Sign a hash using key pair.
 * @param hash - a hash to sign (as a base64url-encoded string)
 * @param keyPair - signing ED25519 keypair
 * @return {object} with "hash", "sig" (signature in hex format), and "pubKey" public key value.
 */
var signHash = function(hsh, keyPair) {
  if (
    !keyPair.hasOwnProperty("publicKey") ||
    !keyPair.hasOwnProperty("secretKey")
  ) {
    throw new TypeError(
      "Invalid KeyPair: expected to find keys of name 'secretKey' and 'publicKey': " +
        JSON.stringify(keyPair)
    );
  }
  var hshBin = b64urlDecodeArr(hsh);
  var sigBin = nacl.sign.detached(hshBin, toTweetNaclSecretKey(keyPair));
  return { hash: hsh, sig: binToHex(sigBin), pubKey: keyPair.publicKey };
};

var pullSig = function(s) {
  if (!s.hasOwnProperty("sig")) {
    throw new TypeError(
      "Expected to find keys of name 'sig' in " + JSON.stringify(s)
    );
  }
  return { sig: s.sig };
};

var pullAndCheckHashs = function(sigs) {
  var hsh = sigs[0].hash;
  for (var i = 1; i < sigs.length; i++) {
    if (sigs[i].hash !== hsh) {
      throw new Error(
        "Sigs for different hashes found: " + JSON.stringify(sigs)
      );
    }
  }
  return hsh;
};

/**
 * Prepare an ExecMsg pact command for use in send or local execution.
 * To use in send, wrap result with 'mkSingleCommand'.
 * @param keyPairs {array or object} - array or single ED25519 keypair and/or clist (list of `cap` in mkCap)
 * @param nonce {string} - nonce value for ensuring unique hash - default to current time
 * @param pactCode {string} - pact code to execute - required
 * @param envData {object} - JSON of data in command - not required
 * @param meta {object} - public meta information, see mkMeta
 * @return valid pact API command for send or local use.
 */
var prepareExecCmd = function(keyPairs=[], nonce=new Date().toISOString(), pactCode,
                              envData, meta=mkMeta("","",0,0,0,0), networkId=null) {

  enforceType(nonce, "string", "nonce");
  enforceType(pactCode, "string", "pactCode");
  var kpArray = asArray(keyPairs);
  var signers = kpArray.map(mkSigner);
  var cmdJSON = {
    networkId: networkId,
    payload: {
      exec: {
        data: envData || {},
        code: pactCode
      }
    },
    signers: signers,
    meta: meta,
    nonce: JSON.stringify(nonce)
  };
  var cmd = JSON.stringify(cmdJSON);
  var sigs = attachSig(cmd, kpArray);
  return mkSingleCmd(sigs, cmd);
};

/**
 * Prepare an ContMsg pact command for use in send or local execution.
 * To use in send, wrap result with 'mkSingleCommand'.
 * @param keyPairs {array or object} - array or single ED25519 keypair and/or clist (list of `cap` in mkCap)
 * @param nonce {string} - nonce value for ensuring unique hash - default to current time
 * @param step {number} - integer index of step to execute in defpact body - required
 * @param proof {string} - JSON of SPV proof, required for cross-chain transfer. See `fetchSPV` below
 * @param rollback {bool} - Indicates if this continuation is a rollback/cancel- required
 * @param pactId {string} - identifies the already-begun Pact execution that this is continuing - required
 * @param envData {object} - JSON of data in command - not required
 * @param meta {object} - public meta information, see mkMeta
 * @return valid pact API Cont command for send or local use.
 */
var prepareContCmd = function(keyPairs=[], nonce=new Date().toISOString(),
                              proof, pactId, rollback, step, envData,
                              meta=mkMeta("","",0,0,0,0), networkId=null) {

  enforceType(nonce, "string", "nonce");
  var kpArray = asArray(keyPairs);
  var signers = kpArray.map(mkSigner);
  var cmdJSON = {
    networkId: networkId,
    payload: {
      cont: {
        proof: proof || null,
        pactId: pactId,
        rollback: rollback,
        step: step,
        data: envData || {},
      }
    },
    signers: signers,
    meta: meta,
    nonce: JSON.stringify(nonce)
  };
  var cmd = JSON.stringify(cmdJSON);
  var sigs = attachSig(cmd, kpArray);
  return mkSingleCmd(sigs, cmd);
};

/**
 * Makes a single command given signed data.
 * @param sigs {array} - array of signature objects, see 'sign'
 * @param cmd {string} - stringified JSON blob used to create hash
 * @return valid Pact API command for send or local use.
 */
var mkSingleCmd = function(sigs, cmd) {
  enforceArray(sigs, "sigs");
  enforceType(cmd, "string", "cmd");
  return {
    hash: pullAndCheckHashs(sigs),
    sigs: sigs.filter(sig => sig.sig).map(pullSig),
    cmd: cmd
  };
};

/**
 * Makes outer wrapper for a 'send' endpoint.
 * @param {array or object} cmds - one or an array of commands, see mkSingleCmd
 */
var mkPublicSend = function(cmds) {
  return { cmds: asArray(cmds) };
};

/**
 * Make an ED25519 "signer" array element for inclusion in a Pact payload.
 * @param {object} kp - a ED25519 keypair and/or clist (list of `cap` in mkCap)
 * @return {object} an object with pubKey, addr and scheme fields.
 */
var mkSigner = function(kp) {
  if (kp.clist) {
    return {
      clist: asArray(kp.clist),
      pubKey: kp.publicKey
    }
  } else {
    return {pubKey: kp.publicKey}
  }
};

var asArray = function(singleOrArray) {
  if (Array.isArray(singleOrArray)) {
    return singleOrArray;
  } else {
    return [singleOrArray];
  }
};

var enforceType = function(val, type, msg) {
  if (typeof val !== type) {
    throw new TypeError(
      msg + " must be a " + type + ": " + JSON.stringify(val)
    );
  }
};

var enforceArray = function(val, msg) {
  if (!Array.isArray(val)) {
    throw new TypeError(msg + " must be an array: " + JSON.stringify(val));
  }
};

/**
 * Make a full 'send' endpoint exec command. See 'prepareExecCmd' for parameters.
 */
var simpleExecCommand = function(keyPairs, nonce, pactCode, envData, meta, networkId) {
  return mkPublicSend(prepareExecCmd(keyPairs, nonce, pactCode, envData, meta, networkId));
};

/**
 * Make a full 'send' endpoint cont command. See 'prepareContCmd' for parameters.
 */
var simpleContCommand = function(keyPairs, nonce, step, pactId, rollback, envData, meta, proof, networkId) {
  return mkPublicSend(prepareContCmd(keyPairs, nonce, proof, pactId, rollback, step, envData, meta, networkId));
};

var unique = function(arr) {
  var n = {},
    r = [];
  for (var i = 0; i < arr.length; i++) {
    if (!n[arr[i]]) {
      n[arr[i]] = true;
      r.push(arr[i]);
    }
  }
  return r;
};

/**
 * Given an exec 'send' message, prepare a message for 'poll' endpoint.
 * @param execMsg {object} JSON with "cmds" field, see 'mkPublicSend'
 * @return {object} with "requestKeys" for polling.
 */
var simplePollRequestFromExec = function(execMsg) {
  var cmds =
    execMsg.cmds ||
    TypeError("expected key 'cmds' in object: " + JSON.stringify(execMsg));
  var rks = [];
  if (
    !cmds.every(function(v) {
      return v.hasOwnProperty("hash");
    })
  ) {
    throw new TypeError(
      'maleformed object, expected "hash" key in every cmd: ' +
        JSON.stringify(execMsg)
    );
  } else {
    rks = unique(
      cmds.map(function(v) {
        return v.hash;
      })
    );
  }
  return { requestKeys: rks };
};

/**
 * Given an exec 'send' message, prepare a message for 'listen' endpoint.
 * @param execMsg {object} JSON with "cmds" field, see 'mkPublicSend'. Only takes first element.
 * @return {object} with "requestKey" for polling.
 */
var simpleListenRequestFromExec = function(execMsg) {
  var cmds =
    execMsg.cmds ||
    TypeError("expected key 'cmds' in object: " + JSON.stringify(execMsg));
  var rks = [];
  if (
    !cmds.every(function(v) {
      return v.hasOwnProperty("hash");
    })
  ) {
    throw new TypeError(
      'maleformed object, expected "hash" key in every cmd: ' +
        JSON.stringify(execMsg)
    );
  } else {
    rks = unique(
      cmds.map(function(v) {
        return v.hash;
      })
    );
  }
  return { listen: rks[0] };
};

/**
 * Variadic function to form a lisp s-expression application.
 * Encases arguments in parens and intercalates with a space.
 */
var mkExp = function(pgmName) {
  enforceType(pgmName, "string", "pgmName");
  return (
    "(" +
    pgmName +
    " " +
    Array.prototype.slice
      .call(arguments, 1)
      .map(JSON.stringify)
      .join(" ") +
    ")"
  );
};

/**
 * Prepare a chainweb-style public meta payload.
 * @param sender {string} gas account
 * @param chainId {string} chain identifier
 * @param gasPrice {number} desired gas price
 * @param gasLimit {number} desired gas limit
 * @param creationTime {number} desired tx's time created in UNIX epoch time as seconds
 * @param ttl {number} desired tx's time to live as seconds
 * @return {object} of arguments, type-checked and properly named.
 */
var mkMeta = function(sender, chainId, gasPrice, gasLimit, creationTime, ttl) {
  enforceType(sender, "string", "sender");
  enforceType(chainId, "string", "chainId");
  enforceType(gasPrice, "number", "gasPrice");
  enforceType(gasLimit, "number", "gasLimit");
  enforceType(creationTime, "number", "creationTime");
  enforceType(ttl,  "number", "ttl");
  return {
    creationTime: creationTime,
    ttl: ttl,
    gasLimit: gasLimit,
    chainId: chainId,
    gasPrice: gasPrice,
    sender: sender
  };
};

/**
 * Formats ExecCmd into api request object
 */
var mkReq = function(cmd) {
  return {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(cmd)
  };
};

/**
 * Parses raw response from server into JSON or TEXT
 */
var parseRes = async function (raw) {
  const rawRes = await raw;
  const res = await rawRes;
  if (res.ok){
     const resJSON = await rawRes.json();
     return resJSON;
   } else {
     const resTEXT = await rawRes.text();
     return resTEXT;
   }
};

 /**
  * An execCmd Object to Execute in send or local.
  * @typedef {Object} cmd to `/send` endpoint
  * @property type {string} - type of command - "cont" or "exec", default to "exec"
  * @property pactCode {string} - pact code to execute in "exec" command - required for "exec"
  * @property nonce {string} - nonce value to ensure unique hash - default to current time
  * @property envData {object} - JSON of data in command - not required
  * @property meta {object} - public meta information, see mkMeta
  * @property networkId {string} network identifier of where the cmd is executed.
  */

 /**
  * A contCmd to Execute in send
  * @typedef {Object} cmd to `/send` endpoint
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

/**
* Sends Pact command to a running Pact server and retrieves tx result.
* @param {[execCmd or contCmd] or execCmd or contCmd} cmd or a list of cmds to execute
* @param {string} apiHost host running Pact server
* @return {object} Request key of the tx received from pact server.
*/
const fetchSend = async function (sendCmd, apiHost) {
  let res = fetchSendRaw(sendCmd, apiHost);
  return parseRes(res);
}

/**
* Sends Pact command to a running Pact server and retrieves raw response.
* @param {[execCmd or contCmd] or execCmd or contCmd} cmd or a list of cmds to execute
* @param {string} apiHost host running Pact server
* @return {Promise} Raw Response from Pact Server
*/

const fetchSendRaw = function(sendCmd, apiHost){
  if (!apiHost)  throw new Error(`Pact.fetch.send(): No apiHost provided`);
  const sendCmds = asArray(sendCmd).map(cmd => {
    if (cmd.type === "cont") {
      return prepareContCmd( cmd.keyPairs, cmd.nonce, cmd.proof, cmd.pactId,
                             cmd.rollback, cmd.step, cmd.envData, cmd.meta,
                             cmd.networkId )
    } else {
      return prepareExecCmd( cmd.keyPairs, cmd.nonce, cmd.pactCode,
                             cmd.envData, cmd.meta, cmd.networkId )
    }
  })
  return fetch(`${apiHost}/api/v1/send`, mkReq(mkPublicSend(sendCmds)));
};

/**
 * A SPV Command Object to Execute in Pact Server.
 * @typedef {Object} spvCmd
 * @property requestKey {string} pactId of the cross-chain transaction
 * @property targetChainId {string} chainId of target chain of the cross-chain transaction
 */

/**
 * Sends request to /spv and retrieves SPV proof.
 * @param {spvCmd} spvCmd see spvCmd
 * @param {string} apiHost host running Pact server
 * @return {string} SPV proof received from Pact server.
 */

const fetchSPV = async function (spvCmd, apiHost) {
  let res = fetchSPVRaw(spvCmd, apiHost);
  return parseRes(res);
}
/**
 * Sends request to /spv and retrieves raw response.
 * @param {spvCmd} spvCmd see spvCmd
 * @param {string} apiHost host running Pact server
 * @return {Promise} Raw Response from Pact Server
 */

const fetchSPVRaw = function(spvCmd, apiHost){
  if (!apiHost)  throw new Error(`Pact.fetch.spv(): No apiHost provided`);
  enforceType(spvCmd.targetChainId, "string", "targetChainId");
  enforceType(spvCmd.requestKey, "string", "requestKey");
  return fetch(`${apiHost}/spv`, mkReq(spvCmd));
};

/**
 * Sends Local Pact command to a local Pact server and retrieves local tx result.
 * @param {execCmd} localCmd a single cmd to execute locally
 * @param {string} apiHost host running Pact server
 * @return {object} tx result received from pact server.
 */

const fetchLocal = async function (localCmd, apiHost) {
  let res = fetchLocalRaw(localCmd, apiHost);
  return parseRes(res);
}
/**
 * Sends Local Pact command to a local Pact server and retrieves raw response.
 * @param {execCmd} localCmd a single cmd to execute locally
 * @param {string} apiHost host running Pact server
 * @return {Promise} Raw Response from Pact Server
 */

const fetchLocalRaw = function(localCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.local(): No apiHost provided`);
  const {keyPairs, nonce, pactCode, envData, meta, networkId} = localCmd
  const cmd = prepareExecCmd(keyPairs, nonce, pactCode, envData, meta, networkId);
  return fetch(`${apiHost}/api/v1/local`, mkReq(cmd));
};

/**
 * Poll result of Pact command on a Pact server and retrieve tx result.
 * @param {{requestKeys: [<rk:string>]}} pollCmd request Keys of txs to poll.
 * @param {string} apiHost host running Pact server
 * @return {object} Array of tx request keys and tx results from pact server.
 */

const fetchPoll = async function (pollCmd, apiHost) {
  let res = fetchPollRaw(pollCmd, apiHost);
  return parseRes(res);
}

/**
 * Poll result of Pact command on a Pact server and retrieves raw response.
 * @param {{requestKeys: [<rk:string>]}} pollCmd request Keys of txs to poll.
 * @param {string} apiHost host running Pact server
 * @return {Promise} Raw Response from Pact Server
 */

const fetchPollRaw = function(pollCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.poll(): No apiHost provided`);
  return fetch(`${apiHost}/api/v1/poll`, mkReq(pollCmd));
};

/**
 * Listen for result of Pact command on a Pact server and retrieve tx result.
 * @param {{listenCmd: <rk:string>}} listenCmd reqest key of tx to listen.
 * @param {string} apiHost host running Pact server
 * @return {object} Object containing tx result from pact server
 */

const fetchListen = async function (listenCmd, apiHost) {
  let res = fetchListenRaw(listenCmd, apiHost);
  return parseRes(res);
}

/**
 * Listen for result of Pact command on a Pact server and retrieves raw response.
 * @param {{listenCmd: <rk:string>}} listenCmd reqest key of tx to listen.
 * @param {string} apiHost host running Pact server
 * @return {Promise} Raw Response from Pact Server
 */

const fetchListenRaw = function(listenCmd, apiHost) {
  if (!apiHost)  throw new Error(`Pact.fetch.listen(): No apiHost provided`);
  return fetch(`${apiHost}/api/v1/listen`, mkReq(listenCmd));
};

/**
  Signing API functions to interact with Chainweaver wallet (https://github.com/kadena-io/chainweaver) and its signing API.
 */

/**
 * Prepares a capability object to be signed with keyPairs using signing API.
 * @param role {string} role of the pact capability
 * @param description {string} description of the pact capability
 * @param name {string} name of pact capability to be signed
 * @param args {array} array of arguments used in pact capability, default to empty array.
 * @return {object} A properly formatted cap object required in signingCmd
 */
var mkCap = function(role, description, name, args=[]) {
  enforceType(role, "string", "role");
  enforceType(description, "string", "description");
  enforceType(name, "string", "name of capability");
  enforceType(args, "object", "arguments to capability");
  return {
    role: role,
    description: description,
    cap: {
      name: name,
      args: args
    }
  };
};

/**
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
 * @property signingPubKey {string} - Public Key that will sign the tx - optional
 **/

/**
 * Sends parameters of Pact Command to the Chainweaver signing API and retrieves a signed Pact Command.
 * @param signingCmd - cmd to be sent to signing API
 * @return {object} valid pact ExecCmd for send or local use.
 **/

 const signWallet = async function (signingCmd) {
   let res = signWalletRaw(signingCmd);
   let resParsed = await parseRes(res);
   return resParsed.body;
 }

/**
 * Sends parameters of Pact Command to the Chainweaver signing API and retrieves raw response.
 * @param signingCmd - cmd to be sent to signing API
 * @return {object} valid pact ExecCmd for send or local use.
 **/

 const signWalletRaw = function (signingCmd){
   if (!signingCmd.pactCode) throw new Error(`Pact.wallet.sign(): No Pact Code provided`);
   if (!signingCmd.caps) throw new Error(`Pact.wallet.sign(): No Caps provided`);
   enforceType(signingCmd.pactCode, "string", "pactCode");
   enforceType(signingCmd.caps, "object", "caps");
   if (signingCmd.envData) enforceType(signingCmd.envData, "object", "envData");
   if (signingCmd.sender) enforceType(signingCmd.sender, "string", "sender");
   if (signingCmd.chainId) enforceType(signingCmd.chainId, "string", "chainId");
   if (signingCmd.gasPrice) enforceType(signingCmd.gasPrice, "number", "gasPrice");
   if (signingCmd.gasLimit) enforceType(signingCmd.gasLimit, "number", "gasLimit");
   if (signingCmd.nonce) enforceType(signingCmd.nonce, "string", "nonce");
   if (signingCmd.ttl) enforceType(signingCmd.ttl, "number", "ttl");
   if (signingCmd.networkId) enforceType(signingCmd.networkId, "string", "networkId");
   if (signingCmd.signingPubKey) enforceType(signingCmd.signingPubKey, "string", "signingPubKey");

   const cmd = {
     code: signingCmd.pactCode,
     caps: asArray(signingCmd.caps),
     data: signingCmd.envData,
     sender: signingCmd.sender,
     chainId: signingCmd.chainId,
     gasLimit: signingCmd.gasLimit,
     gasPrice: signingCmd.gasPrice,
     nonce: signingCmd.nonce,
     ttl: signingCmd.ttl,
     signingPubKey: signingCmd.signingPubKey,
     networkId: signingCmd.networkId
   }
   return fetch('http://127.0.0.1:9467/v1/sign', mkReq(cmd))
 }
/**
 * Sends a signed Pact ExecCmd to a running Pact server and retrieves tx result.
 * @param {signedCmd} valid pact API command for send or local use.
 * @param {string} apiHost host running Pact server
 * @return {object} Request key of the tx received from pact server.
 */
const sendSigned = async function (signedCmd, apiHost) {
  const cmd = {
    "cmds": [ signedCmd ]
  }
  const txRes = await fetch(`${apiHost}/api/v1/send`, mkReq(cmd));
  const tx = await txRes.json();
  return tx;
}

module.exports = {
  crypto: {
    binToHex: binToHex,
    hexToBin: hexToBin,
    base64UrlEncode: b64url.encode,
    base64UrlDecode: b64url.decode,
    base64UrlEncodeArr: b64urlEncodeArr,
    base64UrlDecodeArr: b64urlDecodeArr,
    strToUint8Array: strToUint8Array,
    uint8ArrayToStr: uint8ArrayToStr,
    hash: hash,
    hashBin: hashBin,
    genKeyPair: genKeyPair,
    restoreKeyPairFromSecretKey: restoreKeyPairFromSecretKey,
    sign: sign,
    signHash: signHash,
    verifySig: nacl.sign.detached.verify,
    toTweetNaclSecretKey: toTweetNaclSecretKey
  },
  api: {
    prepareContCmd: prepareContCmd,
    prepareExecCmd: prepareExecCmd,
    mkSingleCmd: mkSingleCmd,
    mkPublicSend: mkPublicSend
  },
  lang: {
    mkExp: mkExp,
    mkMeta: mkMeta,
    mkCap: mkCap
  },
  simple: {
    cont: {
      createCommand: simpleContCommand
    },
    exec: {
      createCommand: simpleExecCommand,
      createLocalCommand: prepareExecCmd,
      createPollRequest: simplePollRequestFromExec,
      createListenRequest: simpleListenRequestFromExec
    }
  },
  fetch: {
    send: fetchSend,
    local: fetchLocal,
    poll: fetchPoll,
    listen: fetchListen,
    spv: fetchSPV
  },
  wallet: {
    sign: signWallet,
    sendSigned: sendSigned
  },
  cut: {
    current: chainweb.cut.current
  },
  event: {
      range: chainweb.event.range,
      recent: chainweb.event.recent,
      stream: chainweb.event.stream,
      height: chainweb.event.height,
      blockHash: chainweb.event.blockHash,
  }
};
