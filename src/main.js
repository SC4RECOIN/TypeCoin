const Blockchain = require('./blockchain/blockchain');
const Transaction = require('./blockchain/transaction');
const EC = require('elliptic').ec;


// generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const privateKey = key.getPrivate('hex');
const walletAddress = privateKey.getPublic('hex');

// chain
const typeCoin = new Blockchain();

// create transaction and mine block
const tx1 = new Transaction(walletAddress, 'address1', 100);
tx1.signTransaction(privateKey);
typeCoin.addTransaction(tx1);
typeCoin.minePendingTransactions(walletAddress);

// create second transaction
const tx2 = new Transaction(walletAddress, 'address2', 50);
tx2.signTransaction(privateKey);
typeCoin.addTransaction(tx2);
typeCoin.minePendingTransactions(walletAddress);

console.log(`Balance of your wallet is ${typeCoin.getBalanceOfAddress(walletAddress)}`);
console.log('The blockchain is ', typeCoin.isChainValid() ? 'valid' : 'invalid');
