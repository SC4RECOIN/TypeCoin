const express = require('express');
const bodyParser = require('body-parser')
import Blockchain = require('../blockchain/blockchain');
import Transaction = require('../blockchain/transaction');
import { ec as EC } from 'elliptic';
import p2pServer = require('./p2p');


const initHttpServer = (httpPort: number, chain: Blockchain, p2p: p2pServer) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req, res) => res.send('Node is running'))

    app.get('/blocks', (req, res) => {
        console.log('Request for chain')
        res.send(chain.getChain());
    });

    app.get('/latest', (req, res) => {
        console.log('Request for chain')
        res.send(chain.getLatestBlock().toString());
    })

    app.post('/transaction', (req, res) => {
        // create transaction
        const transaction = new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount)
        console.log(`New transaction: ${transaction}`)

        // signature
        const ec = new EC('secp256k1');
        const key = ec.keyFromPrivate(req.body.privateKey);
        transaction.signTransaction(key);

        if (transaction.isValid()) {
            chain.addTransaction(transaction);
            res.send(JSON.stringify({message: "Transaction added"}));
        } else {
            res.send("Invalid transaction")
        }
    });

    app.post('/mine', (req, res) => {
        console.log(`Mining next block (reward: ${req.body.rewardAddress})`)
        const newBlock = chain.minePendingTransactions(req.body.rewardAddress);
        res.send(newBlock);
    });

    app.get('/balance', (req, res) => {
        console.log(`Getting address balance [${req.body.address}]`)
        res.send(JSON.stringify({balance: chain.getBalanceOfAddress(req.body.address)}, null, 2));
    });

    app.get('/peers', (req, res) => {
        res.send(p2p.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/peer', (req, res) => {
        p2p.connectToPeers(req.body.peer);
        res.send();
    });

    let server = app.listen(httpPort, () => {
        console.log('Listening http on port: ' + httpPort);
    });

    return server;
}

export { initHttpServer };
