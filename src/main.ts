import Blockchain = require('./blockchain/blockchain');
import p2pServer = require('./network/p2p');
import { initHttpServer } from './network/node';


const typeCoin = new Blockchain();
const p2p = new p2pServer(5000, typeCoin);
initHttpServer(5000, typeCoin, null);
