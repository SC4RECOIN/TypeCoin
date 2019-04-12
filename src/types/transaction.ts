import { ec as EC } from 'elliptic';

interface TxIn {
  txOutId: string;
  txOutIndex: number;
  signature?: EC.Signature;
}

interface TxOut {
  address: string;
  amount: number;
}

interface UnspentTxOut {
  txOutId: string;
  txOutIndex: number;
  address: string;
  amount: number;
}

interface TxRecord {
  from: string,
  to: string,
  amount: number,
  date: string
}

export { TxIn, TxOut, UnspentTxOut, TxRecord }
