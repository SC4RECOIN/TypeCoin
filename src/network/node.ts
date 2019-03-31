const express = require('express');
const bodyParser = require('body-parser')
import Blockchain = require('../blockchain/blockchain');
import Block = require('../blockchain/block/block');
import Transaction = require('../blockchain/transaction/transaction');
import { ec as EC } from 'elliptic';
import p2pServer = require('./p2p');
import { MessageType } from '../types/message'


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

    app.get('/length', (req, res) => {
        res.send(JSON.stringify({length: chain.chain.length}));
    })

    app.post('/transaction', (req, res) => {
        // create transaction
        const transaction = new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount)

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
        const newBlock: Block = chain.minePendingTransactions(req.body.rewardAddress);

        // send chain to peers
        p2p.broadcast({
            'type': MessageType.NEW_BLOCK, 
            'data': newBlock.toString()
        });
        
        res.send(JSON.stringify({
            message: "Block successfully mined",
            statusCode: 200
        }));
    });

    app.post('/balance', (req, res) => {
        res.send(JSON.stringify({balance: chain.getBalanceOfAddress(req.body.address)}, null, 2));
    });

    app.get('/peers', (req, res) => {
        res.send(p2p.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/peer', (req, res) => {
        p2p.connectToPeers(req.body.peer);
        res.send(JSON.stringify({message: "Peer added"}));
    });

    let server = app.listen(httpPort, () => {
        console.log('Listening http on port: ' + httpPort);
    });

    return server;
}

export { initHttpServer };
