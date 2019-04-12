import Blockchain from './blockchain/blockchain';
import p2pServer from './network/p2p';
import Wallet from './wallet/wallet'
import initHttpServer from './network/node';

const portHttp: number = 5700
const portp2p: number = 5800

const typeCoin = new Blockchain();
const wallet = new Wallet();
const p2p = new p2pServer(portp2p, typeCoin);
initHttpServer(portHttp, typeCoin, p2p, wallet);
