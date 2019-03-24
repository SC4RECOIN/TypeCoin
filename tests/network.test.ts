import Blockchain = require('./../src/blockchain/blockchain');
import Transaction = require('./../src/blockchain/transaction');
import { ec as EC } from 'elliptic';
import { expect } from 'chai';
import 'mocha';


describe('Network Tests', function() {

  const port: number = 5050;
  const p2pPort: number = 5000;
  let p2p = new p2pServer(p2pPort, chain);

    // generate a new key pair and convert them to hex-strings
    const ec = new EC('secp256k1');
    const key = ec.genKeyPair();
    const walletAddress = key.getPublic('hex');

    // chain
    const typeCoin = new Blockchain();

    // create transaction and mine block
    const tx1 = new Transaction(walletAddress, 'address1', 100);
    tx1.signTransaction(key);
    typeCoin.addTransaction(tx1);
    typeCoin.minePendingTransactions(walletAddress);

    // verify tx1 exists
    const block = typeCoin.chain[typeCoin.chain.length - 1];

    it('Transaction exists', function() {
      let result = block.getMerkleProof(tx1);
      expect(result).equal(true);
    });

    it('Transaction does not exists', function() {
      const txNotAdded = new Transaction(walletAddress, 'address1', 100);
      let result = block.getMerkleProof(txNotAdded);
      expect(result).equal(false);
    });

    // create second transaction
    const tx2 = new Transaction(walletAddress, 'address2', 50);
    tx2.signTransaction(key);
    typeCoin.addTransaction(tx2);
    typeCoin.minePendingTransactions(walletAddress);

    it('Chain length', function() {
      expect(typeCoin.chain.length).equal(3);
    });
  
    it('Wallet balance', function() {
      let result = typeCoin.getBalanceOfAddress(walletAddress);
      expect(result).equal(50);
    });

    it('Valid chain', function() {
        let result = typeCoin.isChainValid();
        expect(result).equal(true);
      });
  });
