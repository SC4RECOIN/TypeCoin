import Block from './block/block';
import TransactionPool from './transaction/txpool';
import Transaction from './transaction/transaction';
import { TxIn, TxOut, UnspentTxOut } from './../types/transaction';


class Blockchain {

  chain: Block[];
  uTxOuts: UnspentTxOut[];
  difficulty: number;
  pendingTransactions: TransactionPool;
  miningReward: number;

  constructor(blocks?: Block[]) {
    this.chain = blocks || [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = new TransactionPool();
    this.miningReward = 100;
    this.uTxOuts = [];
  }

  createGenesisBlock(): Block {
    return new Block(Date.parse('2017-01-01'), [], '0', 1);
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getChain(): Block[] {
    return this.chain;
  }

  replaceChain(replacement: Block[]): boolean {
    let replaceChain = new Blockchain(replacement);
    if (replaceChain.isChainValid) {
      this.chain = replacement;
      return true;
    }
    return false;
  }

  addBlock(newBlock: Block): boolean {
    if (newBlock.hasValidTransactions) {
      this.chain.push(newBlock);
      return true;
    }
    return false;
  }

  minePendingTransactions(miningRewardAddress: string): Block {
    // coinbase tx
    const rewardTx = Transaction.createCoinbaseTx(miningRewardAddress, this.chain.length, this.miningReward)
    this.pendingTransactions.addTransaction(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions.pool, this.getLatestBlock().hash, this.chain.length + 1);
    block.mineBlock(this.difficulty);
    this.chain.push(block);

    // find new outputs
    const newUTxOuts: UnspentTxOut[] = this.pendingTransactions.pool
      .map((t) => { 
        return t.txOuts.map((txOut, index) => {
          return {
            txOutId: t.id, 
            txOutIndex: index, 
            address: txOut.address, 
            amount: txOut.amount
          }
        });
      })
      .reduce((a, b) => a.concat(b), []);

    // find outputs that have been used
    const consumedTxOuts: UnspentTxOut[] = this.pendingTransactions.pool
      .map((t) => t.txIns)
      .reduce((a, b) => a.concat(b), [])
      .map((txIn) => {
        return {
            txOutId: txIn.txOutId,
            txOutIndex: txIn.txOutIndex, 
            address: '', 
            amount: 0
          }
      });
    
    // update uTxOuts
    this.uTxOuts = this.uTxOuts
      .filter(((uTxO) => !consumedTxOuts.find((cTx) => cTx.txOutId === uTxO.txOutId && cTx.txOutIndex === uTxO.txOutIndex)))
      .concat(newUTxOuts);

    this.pendingTransactions.clearTxPool();
    return block;
  }

  addTransaction(transaction: Transaction) {
    // verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.addTransaction(transaction);
  }

  getBalanceOfAddress(address: string): number {
    const addressUTxO = this.uTxOuts.filter((uTxO) => uTxO.address === address);
    return addressUTxO
      .map((uTxO: UnspentTxOut) => uTxO.amount)
      .reduce((a,b) => a + b, 0);
  }

  isChainValid(): boolean {
    // check genesis block
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // check the remaining blocks
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.calculateHash()) {
        return false;
      }
    }
    return true;
  }
}

export default Blockchain;
