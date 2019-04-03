import Blockchain from '../src/blockchain/blockchain';
import initHttpServer from '../src/network/node';
import p2pServer from '../src/network/p2p';
import Wallet from '../src/wallet/wallet';
import fetch from 'node-fetch';
import { ec as EC } from 'elliptic';
import { expect, assert } from 'chai';
import 'mocha';

const server1Port = 3000;
const server2Port = 5000;
const socket1Port = 3010;
const socket2Port = 5010;

describe('Socket Tests', function() {
  let server1;
  let server2;
  let p2p1;
  let p2p2;
  let wallet1;
  let wallet2;

  before(function() {
    const typeCoin1 = new Blockchain();
    wallet1 = new Wallet();
    p2p1 = new p2pServer(socket1Port, typeCoin1);
    server1 = initHttpServer(server1Port, typeCoin1, p2p1, wallet1);

    wallet2 = new Wallet();
    const typeCoin2 = new Blockchain();
    p2p2 = new p2pServer(socket2Port, typeCoin2);
    server2 = initHttpServer(server2Port, typeCoin2, p2p2, wallet2);
  });

  // close after tests
  after(function() {
    p2p1.server.close();
    server1.close();
    p2p2.server.close();
    server2.close();
  });

  it('Mining without any txs', async function () {
    try {
      const response = await fetch("http://localhost:" + server1Port + "/mine", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardAddress: wallet1.address })
      });
      const data = await response.json();
      expect(data.statusCode).equal(200);
    }
    catch (error) {
      assert.fail(`Mining request failed: ${error}`);
    }
  });

  it('Add peer', async function () {
    try {
      // connect socket to peer
      const response = await fetch("http://localhost:" + server1Port + "/peer", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peer: "http://localhost:" + socket2Port })
      });
      const data = await response.json();
      expect(data.message).equal("Peer added");
    }
    catch (error) {
      assert.fail(`Adding peer failed: ${error}`);
    }
  });

  it('Sending transaction', async function () {
    const transactionMsg = {
      toAddress: wallet2.address,
      amount: 10.0
    }

    try {
      // add transaction to chain
      const response = await fetch("http://localhost:" + server1Port + "/transaction", {
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
      const response = await fetch("http://localhost:" + server1Port + "/mine", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardAddress: wallet1.address })
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
      const response = await fetch("http://localhost:" + server1Port + "/balance", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet1.address })
      });
      const data = await response.json();
      expect(data.balance).equal(190);
    }
    catch (error) {
      assert.fail(`Balance request failed: ${error}`);
    }
  });

  // check the address balance on the other socket/chain
  it('Address balance on peer', async function () {
    try {
      const response = await fetch("http://localhost:" + server2Port + "/balance", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet1.address })
      });
      const data = await response.json();
      expect(data.balance).equal(190);
    }
    catch (error) {
      assert.fail(`Balance request failed: ${error}`);
    }
  });

  it('Chains are same length', async function () {
    try {
      // request length from first chain
      const response1 = await fetch("http://localhost:" + server1Port + "/length", {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
      });
      const data1 = await response1.json();

      // request length from peer chain
      const response2 = await fetch("http://localhost:" + server2Port + "/length", {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
      });
      const data2 = await response2.json();

      expect(data1.length).equal(data1.length);
    }
    catch (error) {
      assert.fail(`Length request failed: ${error}`);
    }
  });
});
