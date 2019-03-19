import Blockchain = require('./blockchain/blockchain');
import Transaction = require('./blockchain/transaction');
import SHA256 = require('crypto-js/sha256');
import { ec as EC } from 'elliptic';

// generate a new key pair and convert them to hex-strings
const ec = new EC('secp256k1');
const key = ec.genKeyPair();
const walletAddress = key.getPublic('hex');

// chain
const typeCoin = new Blockchain();

// create transaction and mine block
const tx1 = new Transaction(walletAddress, 'address1', 100);
tx1.signTransaction(key);
typeCoin.addTransaction(tx1);
typeCoin.minePendingTransactions(walletAddress);

// verify tx1 exists
const block = typeCoin.chain[typeCoin.chain.length - 1];
console.log('The transaction', block.getMerkleProof(tx1) ? 'exists' : 'does not exist');

// create second transaction
const tx2 = new Transaction(walletAddress, 'address2', 50);
tx2.signTransaction(key);
typeCoin.addTransaction(tx2);
typeCoin.minePendingTransactions(walletAddress);

console.log(`Balance of your wallet is ${typeCoin.getBalanceOfAddress(walletAddress)}`);
console.log('The blockchain is', typeCoin.isChainValid() ? 'valid' : 'invalid');
