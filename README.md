# Pact Javascript API

## Pact.sendCommand(commandObj)
Async function that sends a Pact command and returns any data returned by the Pact server, or throws an error on failure.
```
const commandObj = {
  command: 'pactDefinition.method',  // name of method from your Pact definitions
  data: {}, // any data to send to the Pact command
  host: 'https://0.0.0.0/',  // URL of the Pact server to send the command to; optional if Pact.host is set
  keyPairs: [keyPairA, keyPairB]  // Array of keyPairs to send with the command; optional if Pact.keyPairs is set
};

try {
  const data = await Pact.sendCommand(commandObj);
} catch(e) {
  // handle error
}
```

## Application-Wide Defaults
### Default Host
If you'll be sending most or all of your Pact commands to the same server, you can set a default `host` on the static Pact class:
```
Pact.host = 'https://0.0.0.0/';
```
### Default Key Pairs
You can also set your default `keyPairs` during a user session:
```
Pact.keyPairs = [
  {
    publicKey: publcKeyA,
    secretKey: secretKeyA
  },
  {
    publicKey: publicKeyB,
    secretKey: secretKeyB
  }
];
```

## Example
### Pact Module: `records.pact`
```
(module records
  (defschema record
    recordId: string
    name: string
  )
  (deftable record-table:{record})

  (defun read-record-for-id (recordId)
    (read record-table recordId)
  )
)
```

### JavaScript: `records.js`
Where `PACT_HOST` and `KEY_PAIRS` are predefined constants, and `logger.error()` logs errors.
```
function getRecordForId(recordId) {
  try {
    const record = await Pact.sendCommand({
      command: 'records.read-record-for-id',
      data: { recordId },
      host: PACT_HOST,
      keyPairs: KEY_PAIRS
    });
    return record;
  } catch(e) {
    logger.error(e);
  }
}
```
