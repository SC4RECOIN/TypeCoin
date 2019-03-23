import * as WebSocket from 'ws';
import {Server} from 'ws';
import Block = require('../blockchain/block/block');
import Blockchain = require('../blockchain/blockchain');


enum MessageType {
  GET_LATEST = 0,
  GET_ALL = 1,
  RESPONSE = 2,
}

interface Message {
  type: MessageType;
  data: any;
}

class p2pServer {

  chain: Blockchain;
  sockets: WebSocket[];

  constructor(port: number, chain: Blockchain) {
    this.sockets = [];
    this.chain = chain;
    
    const server: Server = new WebSocket.Server({port: port});
    server.on('connection', (ws: WebSocket) => {
      this.initConnection(ws);
    });
    console.log('Websocket listening on port ' + port);
  }

  initConnection(ws: WebSocket): void {
    this.sockets.push(ws);
    this.initMessageHandler(ws);
    this.initErrorHandler(ws);

    // get latest chain
    const message = {
      'type': MessageType.GET_LATEST,
      'data': null
    }
    ws.send(JSON.stringify(message));
  }

  connectToPeers(newPeer: string): void {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        this.initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
  };

  broadcast(message: Message): void {
    this.sockets.forEach((socket) => socket.send(JSON.stringify(message)));
  }

  initMessageHandler(ws: WebSocket): void {
    ws.on('message', (data: string) => {
      const message: Message = JSON.parse(data);
      console.log('Received message' + JSON.stringify(message));

      // return latest block
      if (message.type == MessageType.GET_LATEST) {
        const message = {
          'type': MessageType.RESPONSE,
          'data': JSON.stringify([this.chain.getLatestBlock()])
        }
        ws.send(JSON.stringify(message));
      }

      // return chain
      if (message.type == MessageType.GET_ALL) {
        const message = {
          'type': MessageType.RESPONSE, 
          'data': JSON.stringify(this.chain.getChain())
        }
        ws.send(JSON.stringify(message));
      }

      // receiving blocks
      if (message.type == MessageType.RESPONSE) {
        const receivedBlocks: Block[] = JSON.parse(message.data);
        this.handleBlockchainResponse(receivedBlocks);
      }
    });
  };

  handleBlockchainResponse(receivedBlocks: Block[]): void {
    const thisLatest: Block = this.chain.getLatestBlock();
    const otherLatest: Block = receivedBlocks[receivedBlocks.length - 1];

    // other chain is longer
    if (otherLatest.index > thisLatest.index) {

      // behind by one block
      if (thisLatest.hash === otherLatest.previousHash) {
        if (this.chain.addBlock(otherLatest)) {
          const message = {
            'type': MessageType.RESPONSE,
            'data': JSON.stringify([this.chain.getLatestBlock()])
          }
          // broadcast this latest block
          this.broadcast(message);
        }
      } else if (receivedBlocks.length === 1) {
        console.log('Query the chain from peer');
        const message = {
          'type': MessageType.GET_LATEST,
          'data': null
        }
        this.broadcast(message);

      // behind by more than one block
      } else {
        console.log('Replacing blockchain');
        this.chain.replaceChain(receivedBlocks);
      }
    } else {
      console.log('Chain received not longer');
    }
  }

  initErrorHandler(ws: WebSocket) {
    const closeConnection = (myWs: WebSocket) => {
      console.log('connection failed to peer: ' + myWs.url);
      this.sockets.splice(this.sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
  };
}

export = p2pServer;
