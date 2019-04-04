const SHA256 = require('crypto-js/sha256');
import MerkleTree from './merkletree';
import Transaction from './../transaction/transaction';
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

  constructor(timestamp: number, transactions: Transaction[], previousHash: string = '', index: number=0, nonce: number=0) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.index = index;
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = this.calculateHash();
    
    // need block transactions to construct
    this.merkleRoot = null;
    this.merkleTree = null;
  }

  calculateHash(): string {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
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

  mineBlock(difficulty: number) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    this.calculateMerkleRoot();
  }

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
