import Blockchain from './../src/blockchain/blockchain';
import initHttpServer from './../src/network/node';
import p2pServer from './../src/network/p2p';
import Wallet from '../src/wallet/wallet';
import fetch from 'node-fetch';
import { ec as EC } from 'elliptic';
import { expect, assert } from 'chai';
import 'mocha';


describe('Network Tests', function() {
  const port: number = 3005
  let wallet: Wallet;
  let server;
  let p2p;
  before(function() {
    const typeCoin = new Blockchain();
    p2p = new p2pServer(3010, typeCoin);
    wallet = new Wallet();
    server = initHttpServer(port, typeCoin, p2p, wallet);
  });

  // close server after tests
  after(function() {
    p2p.server.close();
    server.close();
  });

  // generate a new key pair and convert them to hex-strings
  const ec = new EC('secp256k1');
  const keySet1 = ec.genKeyPair();
  const keySet2 = ec.genKeyPair();

  it('Sending transaction', async function () {
    const transactionMsg = {
      fromAddress: keySet1.getPublic('hex'),
      toAddress: keySet2.getPublic('hex'),
      privateKey: keySet1.getPrivate('hex'),
      amount: 10.0
    }

    try {
      // add transaction to chain
      const response = await fetch("http://localhost:" + port + "/transaction", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionMsg)
      });
      const data = await response.json();
      expect(data.message).equal("Transaction added");
    }
    catch (error) {
      assert.fail(`Transaction request failed: ${error}`);
    }
  });

  // mine block with transaction that was just added
  it('Mining', async function () {
    try {
      const response = await fetch("http://localhost:" + port + "/mine", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardAddress: keySet1.getPublic('hex') })
      });
      const data = await response.json();
      expect(data.statusCode).equal(200);
    }
    catch (error) {
      assert.fail(`Mining request failed: ${error}`);
    }
  });

  // check the address balance after transaction
  it('Address balance', async function () {
    try {
      const response = await fetch("http://localhost:" + port + "/balance", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: keySet1.getPublic('hex') })
      });
      const data = await response.json();
      expect(data.balance).equal(90);
    }
    catch (error) {
      assert.fail(`Balance request failed: ${error}`);
    }
  });
});
