import reverse = require('buffer-reverse');
import CryptoJS = require('crypto-js');


interface Proof {
  position: string,
  data: Buffer[]
}

class MerkleTree {

  hashAlgorithm: Function;
  leaves: Buffer[];
  layers: Buffer[][];

  constructor(leaves: string[]) {
    // leaves will create tree base
    this.leaves = leaves.map(x => Buffer.from(x, 'hex'));
    this.layers = [this.leaves];

    this.createHashes(this.leaves)
  }

  createHashes(nodes: Buffer[]) {
    while (nodes.length > 1) {
      const layerIndex = this.layers.length
      this.layers.push([])

      // combine leaf pairs
      for (let i = 0; i < nodes.length - 1; i += 2) {
        // grab next two
        const left = nodes[i]
        const right = nodes[i+1]

        // combine and hash
        const data = Buffer.concat([reverse(left), reverse(right)])
        let hash = this.hash(data)

        this.layers[layerIndex].push(hash)
      }

      // if odd number of nodes
      if (nodes.length % 2 === 1) {
        let data = nodes[nodes.length-1]
        let hash = data

        // duplicate the odd ending nodes
        data = Buffer.concat([reverse(data), reverse(data)])
        hash = this.hash(data)

        this.layers[layerIndex].push(hash)
      }
      nodes = this.layers[layerIndex]
    }
  }

  getRoot(): Buffer {
    return this.layers[this.layers.length-1][0] || Buffer.from([])
  }

  getProof(leaf: string): Proof[] {
    const proof = [];
    const leafBuff = Buffer.from(leaf, 'hex')

    // find index of leaf
    let index = -1
    for (let i = 0; i < this.leaves.length; i++) {
      if (Buffer.compare(leafBuff, this.leaves[i]) === 0) {
        index = i;
        break;
      }
    }

    // leaf does not exist
    if (index === -1) {
      return []
    }

    let shift = 1;
    if (index === (this.leaves.length - 1)) {
      shift = 0;
    }

    // proof generation
    for (let i = 0; i < this.layers.length - 1; i++) {
      // find pair at each layer
      const layer = this.layers[i]
      const isOdd = index % 2
      const pairIndex = isOdd ? index-1 : index+shift

      if (pairIndex < layer.length) {
        proof.push({
          position: isOdd ? 'left': 'right',
          data: layer[pairIndex]
        })
      }

      // set index to parent index
      index = (index/2) | 0
    }
    return proof
  }

  verify(proof: Proof[], targetNode: string, root: string): boolean {
    let hash = Buffer.from(targetNode, 'hex')
    const rootBuff = Buffer.from(root, 'hex')

    if (!Array.isArray(proof) || !proof.length || !targetNode || !rootBuff) {
      return false
    }

    // find merkle root based on proof
    for (let i = 0; i < proof.length; i++) {
      const node = proof[i]
      const isLeftNode = node.position === 'left'
      const buffers = []

      buffers.push(reverse(hash))
      buffers[isLeftNode ? 'unshift' : 'push'](reverse(node.data))

      hash = this.hash(Buffer.concat(buffers))
    }

    // check if the generated hash matches the root
    return Buffer.compare(hash, rootBuff) === 0
  }

  hash(x): Buffer {
    return Buffer.from(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(x.toString('hex'))).toString(CryptoJS.enc.Hex), 'hex')
  }
}

export = MerkleTree
