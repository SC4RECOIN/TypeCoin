import Blockchain from './../src/blockchain/blockchain';
import Transaction from './../src/blockchain/transaction/transaction';
import Wallet from './../src/wallet/wallet';
import { expect } from 'chai';
import 'mocha';


describe('Chain Tests', function() {

    // setup wallet and chain
    const wallet = new Wallet();
    const typeCoin = new Blockchain();

    // mine block to add coins to chain
    typeCoin.minePendingTransactions(wallet.address);

    // create transaction and mine block
    const tx1 = wallet.createTransaction('address1', 100, )
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
