import SHA256 = require('crypto-js/sha256');
import { ec as EC } from 'elliptic';


class Transaction {
  
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: number;
  signature: EC.Signature;

  constructor(fromAddress: string, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash(): string {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
  }

  signTransaction(signingKey: EC.KeyPair) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }
    
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid(): boolean {
    // from mining reward
    if (this.fromAddress === null) return true;

    if (!this.signature) {
      throw new Error('No signature in this transaction');
    }

    const ec = new EC('secp256k1');
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

export = Transaction;
