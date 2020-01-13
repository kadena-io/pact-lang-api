'use strict';

const Pact = require("./pact-lang-api.js");
const creationTime= () => Math.round((new Date).getTime()/1000)-15;

//Paste keyPair
const senderKp = {
  publicKey: "368820f80c324bbc7c2b0610688a7da43e39f91d118732671cd9c7500ff43cca",
  secretKey: "251a920c403ae8c8f65f59142316af3c82b631fba46ddea92ee8c95035bd2898"
}

const cmd = {
    pactCode: `(coin.transfer "sender00" "sender01" 0.1)`,
    meta: {
      sender: "sender00",
      chainId: "0",
      gasPrice: 0.001,
      gasLimit: 1000,
      ttl: 300,
      creationTime: creationTime()
    },
    envData: {},
    nonce: undefined,
    networkId: "development",
  }

const execCmd = (kp) => {
  return Pact.simple.exec.createCommand(
    kp,
    cmd.nonce,
    cmd.pactCode,
    cmd.envData,
    cmd.meta,
    cmd.networkId)
}

let signedCmd = execCmd({
  ...senderKp,
  clist: [
    { name: "coin.GAS", args: [] },
    { name: "coin.TRANSFER", args: ["sender00", "sender01", 0.1] }
  ]
})

let unSignedCmd = execCmd(
  { publicKey: senderKp.publicKey,
    clist: [
      { name: "coin.GAS", args: [] },
      { name: "coin.TRANSFER", args: ["sender00", "sender01", 0.1] }
    ]
  })

let noSigCmd = execCmd(
  { clist: [
      { name: "coin.GAS", args: [] },
      { name: "coin.TRANSFER", args: ["sender00", "sender01", 0.1] }
    ]
  })

const tx = (cmd) => {
  return JSON.stringify(cmd);
}

console.log(`Command signed correctly\n`, tx(signedCmd), "\n")

console.log(
  `Command with signers, but without signatures - need to replace "sigs.sig" field\n`,
  tx(unSignedCmd),
  "\n")

console.log(
  `Command without signers and signatures - will only work on module functions with sender as module guard or local.\n`,
  tx(noSigCmd),
  "\n")
