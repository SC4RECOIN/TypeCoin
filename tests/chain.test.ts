import Blockchain from './../src/blockchain/blockchain';
import { Transaction } from './../src/blockchain/transaction/transaction';
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
    const tx1 = wallet.createTransaction('address_placeholder', 10, typeCoin.uTxOuts)
    typeCoin.addTransaction(tx1);
    typeCoin.minePendingTransactions(wallet.address);

    // verify tx1 exists
    const block = typeCoin.chain[typeCoin.chain.length - 1];

    it('Transaction exists', function() {
      let result = block.getMerkleProof(tx1);
      expect(result).equal(true);
    });

    it('Transaction does not exists', function() {
      // creating transaction and not adding it to chain
      const txNotAdded = wallet.createTransaction('address_placeholder', 10, typeCoin.uTxOuts)
      let result = block.getMerkleProof(txNotAdded);
      expect(result).equal(false);
    });

    // create second transaction
    const tx2 = wallet.createTransaction('address_placeholder', 20, typeCoin.uTxOuts)
    typeCoin.addTransaction(tx2);
    typeCoin.minePendingTransactions(wallet.address);

    it('Chain length', function() {
      // 3 mined block + genesis
      expect(typeCoin.chain.length).equal(4);
    });
  
    it('Wallet balance', function() {
      let result = typeCoin.getBalanceOfAddress(wallet.address);
      expect(result).equal(270);
    });

    it('Valid chain', function() {
      let result = typeCoin.isChainValid();
      expect(result).equal(true);
    });
  });
