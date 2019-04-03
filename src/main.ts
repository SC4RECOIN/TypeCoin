import Blockchain from './blockchain/blockchain';
import p2pServer from './network/p2p';
import Wallet from './wallet/wallet'
import initHttpServer from './network/node';

// pass port number
const args = process.argv.slice(2)
const portHttp: number = parseInt(args[0])
const portp2p: number = parseInt(args[1])

const typeCoin = new Blockchain();
const wallet = new Wallet();
const p2p = new p2pServer(portp2p, typeCoin);
initHttpServer(portHttp, typeCoin, p2p, wallet);
