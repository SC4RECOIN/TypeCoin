import Blockchain from './../src/blockchain/blockchain';
import initHttpServer from './../src/network/node';
import p2pServer from './../src/network/p2p';
import Wallet from '../src/wallet/wallet';
import fetch from 'node-fetch';
import { expect, assert } from 'chai';
import 'mocha';


describe('Node Tests', function() {
  const port: number = 3005
  let wallet: Wallet;
  let server;
  let p2p;
  
  before(function() {
    const typeCoin = new Blockchain();
    p2p = new p2pServer(3010, typeCoin);
    wallet = new Wallet();
    server = initHttpServer(port, typeCoin, p2p, wallet);

    // mine to add coins to wallet
    typeCoin.minePendingTransactions(wallet.address)
  });

  // close server after tests
  after(function() {
    p2p.server.close();
    server.close();
  });

  // create two wallets
  const tempWallet = new Wallet();

  it('Sending transaction', async function () {
    const transactionMsg = {
      toAddress: tempWallet.address,
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
        body: JSON.stringify({ rewardAddress: wallet.address })
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
        body: JSON.stringify({ address: wallet.address })
      });
      const data = await response.json();
      expect(data.balance).equal(190);
    }
    catch (error) {
      assert.fail(`Balance request failed: ${error}`);
    }
  });
});
