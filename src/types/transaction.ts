interface TxIn {
  txOutId: string;
  txOutIndex: number;
  signature?: string;
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

export { TxIn, TxOut, UnspentTxOut }
