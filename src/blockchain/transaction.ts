import { ec as EC } from 'elliptic';
import SHA256 = require('crypto-js/sha256');
import { TxIn, TxOut } from './../types/transaction';

class Transaction {
  id: string;
  txIns: TxIn[];
  txOuts: TxOut[];
  signature: string;

  constructor(txIns: TxIn[], txOuts: TxOut[], signingKey: EC.KeyPair) {
    this.txOuts = txOuts;

    this.id = this.getTransactionId();
    this.signature = signingKey.sign(this.id).toDER('hex');

    // add signature to all txIns
    this.txIns = txIns.map((txIn) => {
      txIn.signature = this.signature;
      return txIn;
    });
  }

  getTransactionId(): string {
    // gather ids and indexes
    const txInContent = this.txIns
      .map((txIn) => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, '');

    const txOutContent = this.txOuts
      .map((txOut) => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, '');

    // hash the content of the inputs and outputs to create id
    return SHA256(txInContent + txOutContent).toString();
  }
} 

export = Transaction
