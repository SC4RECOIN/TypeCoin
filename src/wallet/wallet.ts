import { TxIn, TxOut, UnspentTxOut } from './../types/transaction';
import { Transaction } from '../blockchain/transaction/transaction';
import { ec as EC } from 'elliptic';


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

  updateUTxOuts(uTxOuts: UnspentTxOut[]) {
    // find unspent outputs associated with address
    this.uTxOuts = uTxOuts.filter((uTxO: UnspentTxOut) => uTxO.address === this.address);
  }

  updateWalletBalance() {
    this.balance = 0;
    for (const uTxOut of this.uTxOuts) {
      this.balance += uTxOut.amount;
    }
  }

  createTransaction = (toAddress: string, amount: number, uTxOuts: UnspentTxOut[]): Transaction => {
    this.updateUTxOuts(uTxOuts);
    this.updateWalletBalance();

    if (this.balance < amount) {
      throw Error("Not enough funds to send transaction")
    }

    let found = 0;
    let leftover;
    const txOutsToUse: UnspentTxOut[] = [];

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
    
    // create tx and update uTxOuts
    const tx = new Transaction(txIns, txOuts, this.keyPair);
    this.uTxOuts = this.uTxOuts.filter((uTxO: UnspentTxOut) => {
      txOutsToUse.forEach((txUsed: UnspentTxOut) => {
        if (txUsed.txOutId === uTxO.txOutId) 
          return false;
      })
      return true;
    });

    return tx;
  };
}

export default Wallet;
