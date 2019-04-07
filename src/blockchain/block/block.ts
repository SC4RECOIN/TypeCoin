const SHA256 = require('crypto-js/sha256');
const BigNumber = require('bignumber.js');
import MerkleTree from './merkletree';
import { Transaction } from './../transaction/transaction';
import { UnspentTxOut } from '../../types/transaction';


class Block {

  index: number;
  previousHash: string;
  merkleRoot: string;
  merkleTree: MerkleTree;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;

  minterBalance: number; 
  minterAddress: string;

  constructor(transactions: Transaction[], previousHash: string = '', index: number=0, minterBalance: number, minterAddress: string) {
    this.previousHash = previousHash;
    this.index = index;
    this.transactions = transactions;
    this.minterBalance = minterBalance;
    this.minterAddress = minterAddress;
    this.hash = this.calculateHash();
    
    // need block transactions to construct
    this.merkleRoot = null;
    this.merkleTree = null;
  }

  calculateHash(): string {
    const txs = JSON.stringify(this.transactions);
    return SHA256(this.index + this.previousHash + this.timestamp + txs + this.minterBalance + this.minterAddress).toString();
  }

  calculateMerkleRoot() {
    const leaves = this.transactions.map(t => SHA256(t.id).toString());
    this.merkleTree = new MerkleTree(leaves)
    this.merkleRoot = this.merkleTree.getRoot().toString('hex')
  }

  getMerkleProof(transaction: Transaction): boolean {
    const leaf = SHA256(transaction.id).toString()
    const proof = this.merkleTree.getProof(leaf)
    return this.merkleTree.verify(proof, leaf, this.merkleRoot)
  }

  mineBlock(difficulty: number, allowZeroBalanceMinting: boolean=false) {
    let pastTimestamp: number = 0;
    while (true) {
      // check every second
      this.timestamp = Math.round(new Date().getTime() / 1000);
      if(pastTimestamp !== this.timestamp) {
        if (this.isBlockStakingValid(difficulty, allowZeroBalanceMinting)) {
          this.hash = this.calculateHash();
          this.calculateMerkleRoot();
          return;
        }
        pastTimestamp = this.timestamp;
      }
    }
  }

  isBlockStakingValid(difficulty: number, allowZeroBalanceMinting: boolean): boolean {
    // allow minting without coins for a few blocks
    if (this.minterBalance === 0 && allowZeroBalanceMinting) {
      this.minterBalance = 1;
    }

    // SHA256(prevhash + address + timestamp) <= 2^256 * balance / diff
    const stakingPower = new BigNumber(2).exponentiatedBy(256).times(this.minterBalance).dividedBy(difficulty);
    const stakingHash: string = SHA256(this.previousHash + this.minterAddress + this.timestamp);
    return stakingPower.minus(new BigNumber(stakingHash, 16)).toNumber() >= 0;
  };

  hasValidTransactions(uTxOuts: UnspentTxOut[]): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid(uTxOuts)) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return JSON.stringify({
      index: this.index,
      hash: this.hash,
      previousHash: this.previousHash,
      merkleRoot: this.merkleRoot,
      timestamp: this.timestamp,
      transactions: this.transactions,
      nonce: this.nonce
    }, null, 2);
  }
}

export default Block;
