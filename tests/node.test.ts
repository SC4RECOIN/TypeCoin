import Blockchain = require('./../src/blockchain/blockchain');
import Transaction = require('./../src/blockchain/transaction');
import { initHttpServer } from './../src/network/node';
const fetch = require('node-fetch')
import { ec as EC } from 'elliptic';
import { expect, assert } from 'chai';
import 'mocha';


describe('Network Tests', function() {

  const port: number = 3005
  const typeCoin = new Blockchain();
  let server = initHttpServer(port, typeCoin, null);

  // generate a new key pair and convert them to hex-strings
  const ec = new EC('secp256k1');
  const key = ec.genKeyPair();
  const walletAddress = key.getPublic('hex');

  it('Sending transaction', async () => {
    console.log("Adding transaction")
    const transactionMsg = {
      fromAddress: "04cd5914b1117f6da8bff002a32056633c1ecdf2287e13b47dee94aaa7dbd2fe3c5cd215bb3421f09d88efa13fc796339c2476e3da094f8e97d6c00dd24f46830e",
      toAddress: "05aa6414b1337e3da8bff003a32056633c1ecdf2287e13b47dee94aaa7dbd2fe3c5cd215bb3421f09d88efa13fc796339c2476e3da094f8e97d6c00dd24f46830e",
      privateKey: "cd357477ae0c20c5e16e8366949a1c0988d98d68ee7dc8f1f3ee084f991c9c1e",
      amount: 10.0
    }

    await fetch("http://localhost:" + port + "/transaction", {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(transactionMsg)
    }).then(response => response.json())
      .then(data => { 
        expect(data.message).equal("Transaction added");
      })
      .catch(error => assert.fail("Transaction added", "Error sending transaction", error))
  });

  // server.close();
});
