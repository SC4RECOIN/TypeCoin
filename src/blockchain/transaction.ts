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

  signTransaction(signingKey: EC.KeyPair): boolean {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      console.log('You cannot sign transactions for other wallets!')
      return false;
    }
    
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
    return true;
  }

  isValid(): boolean {
    // from mining reward
    if (this.fromAddress === null) return true;

    if (!this.signature) {
      console.log('No signature in this transaction');
      return false;
    }

    const ec = new EC('secp256k1');
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }

  toString(): string {
    return JSON.stringify({
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      timestamp: this.timestamp,
      signature: this.signature
    }, null, 2);
  }
}

export = Transaction;
