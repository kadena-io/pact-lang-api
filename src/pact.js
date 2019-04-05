import { Crypto } from './crypto';

const KEY_PAIR = Crypto.genKeyPair();

export class Pact {
  static async sendCommand({ command, envData = {}, host = undefined, keyPairs = undefined }) {
    const apiHost = host ? host : Pact.host;
    const keyPairSets = keyPairs ? keyPairs : Pact.keyPairs;

    if (!apiHost) {
      throw new Error(
        'Pact.sendCommand(): No `host` provided, and Pact() not instantiated with `host`'
      );
    }
    if (!command) {
      throw new Error('Pact.sendCommand(): No `command` provided');
    }
    if (!keyPairSets) {
      throw new Error(
        'Pact.sendCommand(): No `keyPairs` provided and Pact() not instantiated with `keyPairs`'
      );
    }

    const commandJSON = Pact.simpleExecCommand({
      keyPairs: keyPairSets,
      code: command,
      envData
    });

    // Fire a POST to /api/v1/send and parse the response for Command hashes
    const commandResponse = await fetch(`${apiHost}/api/v1/send`, {
      method: 'POST',
      body: JSON.stringify(commandJSON)
    });
    const commandResponseJSON = await commandResponse.json();
    if (commandResponseJSON.status === 'failure') {
      throw new Error(`PACT Failure in ${command}: ${commandResponseJSON.error}`);
    }

    // Fire a POST to /api/v1/listen to listen for the result of a single command
    const listenResponse = await fetch(`${apiHost}/api/v1/listen`, {
      method: 'POST',
      body: JSON.stringify({ listen: commandJSON.cmds[0].hash })
    });
    const listenResponseJSON = await listenResponse.json();
    if (
      listenResponseJSON.status === 'failure' ||
      listenResponseJSON.response.result.status === 'failure'
    ) {
      throw new Error(`PACT Failure in ${command} listen: ${listenResponseJSON.error}`);
    }

    return listenResponseJSON.response.result.data;
  }

  static simpleExecCommand({ keyPairs, code, envData = {}, address }) {
    // Input: single or array of keyPairs, nonce, code, optional address, data object
    // Output: a correctly formatted JSON exec msg for pact API
    // Throws PactError on maleformed inputs
    const nonce = Date.now().toString();
    const payload = { exec: { code, envData } };

    const cmd = JSON.stringify({ nonce, payload, address });

    const sigs = Array.isArray(keyPairs)
      ? keyPairs.map(kp => Crypto.sign(cmd, kp))
      : [Crypto.sign(cmd, keyPairs)];

    // Test that all commands have the same hash
    const { hash } = sigs[0];
    if (sigs.filter(s => s.hash !== hash).length > 0) {
      throw new Error('Sigs for different hashes found: ' + JSON.stringify(sigs));
    }
    return { cmds: [{ hash, sigs, cmd }] };
  }
}
