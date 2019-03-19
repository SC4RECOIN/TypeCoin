const reverse = require('buffer-reverse')
const CryptoJS = require('crypto-js')
const treeify = require('treeify')


class MerkleTree {

  hashAlgorithm: Function;
  leaves: Buffer[];
  layers: Buffer[][];

  constructor(leaves: string[], hashAlgorithm: Function) {
    this.hashAlgorithm = bufferifyFn(hashAlgorithm);
    this.leaves = leaves.map(x => Buffer.from(x));
    this.layers = [this.leaves];

    this.createHashes(this.leaves)
  }

  createHashes(nodes) {
    while (nodes.length > 1) {
      const layerIndex = this.layers.length
      this.layers.push([])

      for (let i = 0; i < nodes.length - 1; i += 2) {
        const left = nodes[i]
        const right = nodes[i+1]
        let data = null

        data = Buffer.concat([reverse(left), reverse(right)])
        let hash = this.hashAlgorithm(data)

        // double hash
        hash = reverse(this.hashAlgorithm(hash))

        this.layers[layerIndex].push(hash)
      }

      // if odd number of nodes
      if (nodes.length % 2 === 1) {
        let data = nodes[nodes.length-1]
        let hash = data

        // duplicate the odd ending nodes
        data = Buffer.concat([reverse(data), reverse(data)])
        hash = this.hashAlgorithm(data)
        hash = reverse(this.hashAlgorithm(hash))

        this.layers[layerIndex].push(hash)
      }

      nodes = this.layers[layerIndex]
    }
  }

  getRoot(): Buffer {
    return this.layers[this.layers.length-1][0] || Buffer.from([])
  }

  getProof(leaf: string): object[] {
    const proof = [];
    const leafBuff = Buffer.from(leaf);

    // find index of leaf
    let index = -1
    for (let i = 0; i < this.leaves.length; i++) {
      if (Buffer.compare(leafBuff, this.leaves[i]) === 0) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      return []
    }

    let shift = 1;
    if (index === (this.leaves.length - 1)) {
      shift = 0;
    }

    // proof generation
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i]
      const isRightNode = index % 2
      const pairIndex = (isRightNode ? index - 1: index + shift)

      if (pairIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'left': 'right',
          data: layer[pairIndex]
        })
      }

      // set index to parent index
      index = (index / 2) | 0
    }
    return proof
  }

  verify(proof: any[], targetNode: string, root: string): boolean {
    let hash = Buffer.from(targetNode)

    if (!Array.isArray(proof) || !proof.length || !targetNode || !root) {
      return false
    }

    for (let i = 0; i < proof.length; i++) {
      const node = proof[i]
      const isLeftNode = (node.position === 'left')
      const buffers = []

      buffers.push(reverse(hash))
      buffers[isLeftNode ? 'unshift' : 'push'](reverse(node.data))

      hash = this.hashAlgorithm(Buffer.concat(buffers))
      hash = reverse(this.hashAlgorithm(hash))
    }
    return Buffer.compare(hash, Buffer.from(root)) === 0
  }
}

function bufferifyFn (f) {
  return function (x) {
    const v = f(x)
    if (Buffer.isBuffer(v)) {
      return v
    }

    // crypto-js support
    return Buffer.from(f(CryptoJS.enc.Hex.parse(x.toString('hex'))).toString(CryptoJS.enc.Hex), 'hex')
  }
}

export = MerkleTree
