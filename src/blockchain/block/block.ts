import SHA256 = require('crypto-js/sha256');
import Transaction = require('./../transaction');
import MerkleTree = require('./merkletree')


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
    const leaves = this.transactions.map(t => SHA256(t.toString()).toString());
    this.merkleTree = new MerkleTree(leaves)
    this.merkleRoot = this.merkleTree.getRoot().toString('hex')
  }

  getMerkleProof(transaction: Transaction): boolean {
    const leaf = SHA256(transaction.toString()).toString()
    const proof = this.merkleTree.getProof(leaf)
    return this.merkleTree.verify(proof, leaf, this.merkleRoot)
  }

  mineBlock(difficulty: number) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    this.calculateMerkleRoot();
    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
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

export = Block;
