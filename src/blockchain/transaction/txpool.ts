import Transaction = require('./transaction');
import { TxIn, TxOut, UnspentTxOut } from '../../types/transaction';


class TransactionPool {

  pool: Transaction[];

  constructor() {
      this.pool = [];
  }

  addTransaction(tx: Transaction) {
    if (!tx.isValid()) {
      throw Error('Cannot add invalid tx to pool')
    }

    // check if tx outputs are used in another tx in pool
    for (const txIn of tx.txIns) {
      for (const poolTx of this.pool) {
        for (const txInPool of poolTx.txIns) {
          // throw error if uTxOuts being used in another tx
          if (txIn.txOutIndex === txInPool.txOutIndex && txIn.txOutId === txInPool.txOutId) {
            throw Error('Invalid transaction (uTxOuts being used in another tx)');
          }
        }
      }
    }
    this.pool.push(tx);
  }
}

export = TransactionPool;
