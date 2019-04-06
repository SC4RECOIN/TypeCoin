import { ec as EC } from 'elliptic';
const SHA256 = require('crypto-js/sha256');
import { TxIn, TxOut, UnspentTxOut } from '../../types/transaction';

class Transaction {
  id: string;
  txIns: TxIn[];
  txOuts: TxOut[];
  signature: EC.Signature;

  constructor(txIns: TxIn[], txOuts: TxOut[], signingKey?: EC.KeyPair) {
    this.txOuts = txOuts;
    this.txIns = txIns;

    this.id = this.getTransactionId();
    this.signature = signingKey != null ? signingKey.sign(this.id) : null;

    // add signature to all txIns
    this.txIns = txIns.map((txIn) => {
      txIn.signature = this.signature;
      return txIn;
    });
  }

  static createCoinbaseTx(address: string, blockIndex: number, amount: number): Transaction {
    const txIn = {
      txOutId: '',
      txOutIndex: blockIndex
    }

    const txOut = {
      address: address,
      amount: amount
    }

    return new Transaction([txIn], [txOut]);
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

  isValid(uTxOuts: UnspentTxOut[]): boolean {
    this.txIns.forEach((txIn) => {
      // find output for tx inputs
      const refUTxOut = uTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
      if (refUTxOut == null) return false;
  
      // find address and check signature of txIn
      const ec = new EC('secp256k1');
      const key = ec.keyFromPublic(refUTxOut.address, 'hex');
      
      if(!key.verify(this.id, txIn.signature)) return false;
    })

    return true;
  }
} 

// validating transactions that have been broadcasted
const isTxValid = (tx: Transaction, uTxOuts: UnspentTxOut[]): boolean => {
  tx.txIns.forEach((txIn) => {
    // find output for tx inputs
    const refUTxOut = uTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if (refUTxOut == null) return false;

    // find address and check signature of txIn
    const ec = new EC('secp256k1');
    const key = ec.keyFromPublic(refUTxOut.address, 'hex');
    
    if(!key.verify(tx.id, txIn.signature)) return false;
  })

  return true;
}

export { Transaction, isTxValid}
