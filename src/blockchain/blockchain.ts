import Block from './block/block';
import TransactionPool from './transaction/txpool';
import { Transaction, isTxValid } from './transaction/transaction';
import { UnspentTxOut } from './../types/transaction';


class Blockchain {

  chain: Block[];
  uTxOuts: UnspentTxOut[];
  difficulty: number;
  pendingTransactions: TransactionPool;
  miningReward: number;
  zeroStakeCnt: number;
  blockGenerationInv: number;
  diffAdjustmentInv: number;

  constructor(blocks?: Block[]) {
    this.chain = blocks || [this.createGenesisBlock()];
    this.difficulty = 1;
    this.pendingTransactions = new TransactionPool();
    this.miningReward = 100;
    this.uTxOuts = [];

    // this is the number of block that can be mined by addresses with zero stake
    this.zeroStakeCnt = 100;

    // intervals in seconds
    this.blockGenerationInv = 15

    // interval in blocks
    this.diffAdjustmentInv = 10
  }

  createGenesisBlock(): Block {
    return new Block([], '0', 1, null, null);
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
    newBlock.transactions.forEach((tx) => {
      if (!isTxValid(tx, this.uTxOuts)) return false;
    })

    this.chain.push(newBlock);
    this.updateUnspentTxOs(newBlock.transactions);

    // difficulty adjustment
    if (this.chain.length % this.diffAdjustmentInv === 0) {
      this.adjustDifficulty();
    }

    return true;
  }

  updateUnspentTxOs(txs: Transaction[]) {
    // find new outputs
    const newUTxOuts: UnspentTxOut[] = txs
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
    const consumedTxOuts: UnspentTxOut[] = txs
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
  }

  minePendingTransactions(miningRewardAddress: string): Block {
    // coinbase tx
    const rewardTx = Transaction.createCoinbaseTx(miningRewardAddress, this.chain.length, this.miningReward)
    this.pendingTransactions.addTransaction(rewardTx, this.uTxOuts);

    let block = new Block(this.pendingTransactions.pool, this.getLatestBlock().hash, this.chain.length + 1, this.getBalanceOfAddress(miningRewardAddress), miningRewardAddress);
    block.mineBlock(this.difficulty, this.zeroStakeCnt > this.chain.length);
    this.addBlock(block);

    this.pendingTransactions.clearTxPool();
    return block;
  }

  addTransaction(transaction: Transaction) {
    // verify the transactiion
    if (!transaction.isValid(this.uTxOuts)) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.addTransaction(transaction, this.uTxOuts);
  }

  getBalanceOfAddress(address: string): number {
    const addressUTxO = this.uTxOuts.filter((uTxO) => uTxO.address === address);
    return addressUTxO
      .map((uTxO: UnspentTxOut) => uTxO.amount)
      .reduce((a,b) => a + b, 0);
  }

  adjustDifficulty() {
    // find difference between expected and actual block generation time
    const prevAdjustmentBlock: Block = this.chain[this.chain.length - this.diffAdjustmentInv];
    const timeTaken = this.chain[this.chain.length - 1].timestamp - prevAdjustmentBlock.timestamp;
    const timeExpected = this.blockGenerationInv * this.diffAdjustmentInv;
    
    if (timeTaken < timeExpected / 2) {
      this.difficulty++;
      console.log(`Increasing the difficulty to ${this.difficulty}`)
    } else if (timeTaken > timeExpected * 2) {
      this.difficulty--;
      console.log(`Decreasing the difficulty to ${this.difficulty}`)
    } 
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

      if (!currentBlock.hasValidTransactions(this.uTxOuts))
        return false;

      if (currentBlock.hash !== currentBlock.calculateHash())
        return false;

      if (currentBlock.index !== previousBlock.index + 1)
        return false;

      if (currentBlock.hash !== currentBlock.calculateHash()) 
        return false;

      if (currentBlock.previousHash !== previousBlock.calculateHash()) 
        return false;
    }

    return true;
  }
}

export default Blockchain;
