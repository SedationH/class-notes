class Node {
  constructor(val = null) {
    this.val = val
    this.next = null
  }
}

class LinkListQueue {
  constructor() {
    this.dummyHead = new Node()
    this.head =this. dummyHead
    this.cnt = 0
  }

  enQueue(node) {
    this.head.next = node
    this.head = node
    this.cnt++
    return this.cnt
  }

  deQueue() {
    const deleteNode = this.dummyHead.next
    if (deleteNode) {
      this.dummyHead.next = deleteNode.next
      deleteNode.next = null
      this.cnt--
    }
    return deleteNode
  }

  showQueue() {
    let p = this.dummyHead.next
    while (p) {
      console.log(p.val)
      p = p.next
    }
  }
}

const lq = new LinkListQueue()
lq.enQueue(new Node(1))
lq.enQueue(new Node(2))
lq.enQueue(new Node(3))
lq.enQueue(new Node(4))

lq.deQueue()
lq.enQueue(new Node(5))
lq.deQueue()

lq.showQueue()
// 3
// 4
// 5
