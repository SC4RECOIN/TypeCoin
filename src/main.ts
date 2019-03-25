import Blockchain = require('./blockchain/blockchain');
import p2pServer = require('./network/p2p');
import { initHttpServer } from './network/node';

// pass port number
const args = process.argv.slice(2)
const portHttp: number = parseInt(args[0])
const portp2p: number = parseInt(args[1])

const typeCoin = new Blockchain();
const p2p = new p2pServer(portp2p, typeCoin);
initHttpServer(portHttp, typeCoin, p2p);
