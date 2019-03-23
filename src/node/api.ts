const express = require('express');
const bodyParser = require('body-parser')
import Blockchain = require('../blockchain/blockchain');
import p2pServer = require('./p2p');

let chain = new Blockchain();

const port: number = 5050;
const p2pPort: number = 5000;
let p2p = new p2pServer(p2pPort, chain);

const app = express();
app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.send(chain.getChain());
});
app.post('/mineBlock', (req, res) => {
    console.log(`Mining next block (reward: ${req.body.address})`)
    const newBlock = chain.minePendingTransactions(req.body.address);
    res.send(newBlock);
});
app.get('/peers', (req, res) => {
    res.send(p2p.sockets.map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});
app.post('/addPeer', (req, res) => {
    p2p.connectToPeers(req.body.peer);
    res.send();
});

app.listen(port, () => {
    console.log('Listening http on port: ' + port);
});
