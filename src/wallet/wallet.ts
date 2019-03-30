import { TxIn, TxOut, UnspentTxOut } from './../types/transaction';
import Transaction = require('./../blockchain/transaction');
import { ec as EC } from 'elliptic';
import SHA256 = require('crypto-js/sha256');


class Wallet {
  keyPair: EC.KeyPair;
  address: string;
  uTxOuts: UnspentTxOut[];
  balance: number;

  constructor() {
    const ec = new EC('secp256k1');
    this.keyPair = ec.genKeyPair();
    this.address = this.keyPair.getPublic('hex');
    this.uTxOuts = [];
    this.balance = 0;
  }

  updateUTxOuts(uTxOuts: UnspentTxOut[], txPool: Transaction[]) {
    // find unspent outputs associated with address
    this.uTxOuts = uTxOuts.filter((uTxO: UnspentTxOut) => uTxO.address === this.address);

    // TODO: filter out trasaction outputs that are in the tx pool
  }

  updateWalletBalance() {
    this.balance = 0;
    for (const uTxOut of this.uTxOuts) {
      this.balance += uTxOut.amount;
    }
  }

  createTransaction = (toAddress: string, amount: number, uTxOuts: UnspentTxOut[], txPool: Transaction[]): Transaction => {
    this.updateUTxOuts(uTxOuts, txPool);
    this.updateWalletBalance();

    if (this.balance < amount) {
      throw Error("Not enough funds to send transaction")
    }

    let found = 0;
    let leftover;
    const txOutsToUse = [];

    // loop over outputs until enough is found
    for (const uTxOut of this.uTxOuts) {
      txOutsToUse.push(uTxOut);
      found += uTxOut.amount;
      
      // if enough outputs were found to create tx
      if (found >= amount) {
        leftover = found - amount;
        break;
      }
    }

    // create tranaction inputs from uTxOs
    const txIns: TxIn[] = txOutsToUse
      .map((uTxOut): TxIn => {
        return {
          txOutId: uTxOut.txOutId,
          txOutIndex: uTxOut.txOutIndex,
        }
      });

    const txOuts: TxOut[] = [{address: toAddress, amount: amount}]

    // send leftover back 
    if (leftover != 0) {
      txOuts.push({address: this.address, amount: leftover})
    }
    
    return new Transaction(txIns, txOuts, this.keyPair);
  };
}

