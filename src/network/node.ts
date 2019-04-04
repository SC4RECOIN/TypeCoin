const express = require('express');
const bodyParser = require('body-parser')
import Blockchain from '../blockchain/blockchain';
import Transaction from '../blockchain/transaction/transaction';
import Block from '../blockchain/block/block';
import Wallet from '../wallet/wallet';
import p2pServer from './p2p';
import { MessageType } from '../types/message'


const initHttpServer = (httpPort: number, chain: Blockchain, p2p: p2pServer, wallet: Wallet) => {
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
        let tx: Transaction;
        try {
            tx = wallet.createTransaction(req.body.toAddress, req.body.amount, chain.uTxOuts);
            chain.addTransaction(tx);
            res.send(JSON.stringify({message: "Transaction added"}));
        } catch (err) {
            res.send(JSON.stringify({message: err.message}));
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

export default initHttpServer;
