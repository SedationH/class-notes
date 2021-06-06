## 简述 Node.js 的特点以及适用的场景。

### 特点

- V8引擎驱动执行

- 通过事件机制完成非阻塞IO

> **All JavaScript ,V8, and the event loop run in one thread, called the main thread**

V8为JS提供的执行环境是单线程的，但其内部的internalBinding调用的一些C++代码是可以通过线程池调用多线程进行执行的（但是规定好的，有限，参考`Crypto`

此外，还有一些是借助系统提供的接口进行执行的，如`http`

- 跨平台 通过libuv抽象系统调用



### 场景

IO密集型

SSR需要服务存在node环境进行



## 简述 Buffer 的使用.包括多种创建方式。实例方法，静态方法。

类似Array，数据以字节为单位(B)

```js
// 创建
;(function () {
  const b1 = Buffer.alloc(10) // B为单位
  console.log(b1)
  // 下面👇16进制 00000000 对应 00
  {
    /* <Buffer 00 00 00 00 00 00 00 00 00 00> */
  }

  // 不保证空间数据的初始化
  const b2 = Buffer.allocUnsafeSlow(10)
  console.log(b2)

  // 默认为utf-8
  const b3 = Buffer.from('1', 'utf8')
  console.log(b3)
  const b4 = Buffer.from([1, 2, 3])
  console.log(b4)
  // ⚠️数字和字符串1 utf编码下 不一致

  const b5 = Buffer.alloc(3)
  const b6 = Buffer.from(b5)

  b6[0] = 1
  console.log(b5, b6)
  //  是拷贝关系
  {
    /* <Buffer 00 00 00> <Buffer 01 00 00> */
  }
})
// 常用方法
;(function () {
  const b1 = Buffer.alloc(6)
  b1.fill('123')
  console.log(b1.toString())
  // 123123

  // fill 尽可能填满（有限重复
  // write 写入
  // toString
  // slice
  // indexOf
  // copy

  // 很多东西和Array相似，不过编码相关的问题需要特别注意
  // 比如中文在buffer中实际上是 1 -> 3 的关系
  // 大小也不可动态调整

  // concat
  const b2 = Buffer.from('foo')
  const b3 = Buffer.from('bar')
  console.log(Buffer.concat([b2, b3]).toString())

  // is Buffer
})
```

## 写出5个以上文件操作的API，并且用文字说明其功能

![image-20210606105243493](/Users/sedationh/Library/Application Support/typora-user-images/image-20210606105243493.png)

## 简述使用流操作的优势，以及Node中流的分类

它们是一种以高效的方式处理读/写文件、网络通信、或任何类型的端到端的信息交换。

在传统的方式中，当告诉程序读取文件时，这会将文件从头到尾读入内存，然后进行处理。

使用流，则可以逐个片段地读取并处理（而无需全部保存在内存中）。

相对于使用其他的数据处理方法，流基本上提供了两个主要优点：

- **内存效率**: 无需加载大量的数据到内存中即可进行处理。
- **时间效率**: 当获得数据之后即可立即开始处理数据，这样所需的时间更少，而不必等到整个数据有效负载可用才开始。



### 分类

- `Readable`: 可以通过管道读取、但不能通过管道写入的流（可以接收数据，但不能向其发送数据）。 当推送数据到可读流中时，会对其进行缓冲，直到使用者开始读取数据为止。
- `Writable`: 可以通过管道写入、但不能通过管道读取的流（可以发送数据，但不能从中接收数据）。
- `Duplex`: 可以通过管道写入和读取的流，基本上相对于是可读流和可写流的组合。
- `Transform`: 类似于双工流、但其输出是其输入的转换的转换流。



## 在数据封装与解封装过程中，针对应用层、传输层、网络层、数据链路层、物理层5层分别做了什么事情

应用层 data 具体的进程如何处理数据？有协议

传输层  指定端口 

网络层 IP 路由转发 分隔数据包

数据链路层 当前局域网下 MAC 寻址

物理 处理硬件接口，不同的传输信号

#### 统计指定目录中文件总大小。要考虑目录中还有子目录的情况。

- `stat` follows symlinks. When given a path that is a symlink, it returns the stat of the target of the symlink.
- `lstat` doesn't follow symlinks. When given a path that is a symlink it returns the stat of the symlink and not its target.
- `fstat` takes a file descriptor rather than a path.

```js
const fs = require('fs/promises')
const path = require('path')

// 传入指令目录 相对 or 绝对
// node 01 path

const inputPath = process.argv[2]
const finalPath = path.resolve(inputPath)

;(async () => {
  const size = await core(finalPath)
  console.log(size)
})()

async function core(rootItemPath) {
  const fileSizes = new Map()
  await processItem(rootItemPath)

  return Array.from(fileSizes.values()).reduce((prev, curr) => {
    return prev + curr
  }, 0)

  async function processItem(itemPath) {
    const stats = await fs.lstat(itemPath)
    fileSizes.set(stats.ino, stats.size)

    if (stats.isDirectory()) {
      const directoryItemPaths = await fs.readdir(itemPath)
      await Promise.all(
        directoryItemPaths.map(directoryItemPath =>
          processItem(path.join(itemPath, directoryItemPath))
        )
      )
    }
  }
}

```

![image-20210606142127592](http://picbed.sedationh.cn/image-20210606142127592.png)

## 编写单向链表类并且实现队列的入列出列操作

```js
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
```

## 静态服务实现

```js
$ npm link
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN sh-serve@1.0.0 No description
npm WARN sh-serve@1.0.0 No repository field.

updated 1 package in 1.985s
/Users/sedationh/.nvm/versions/node/v14.15.5/bin/sh-serve -> /Users/sedationh/.nvm/versions/node/v14.15.5/lib/node_modules/sh-serve/bin/static-server.js
/Users/sedationh/.nvm/versions/node/v14.15.5/lib/node_modules/sh-serve -> /Users/sedationh/workspace/current/class-notes/07Node/00/end/02static-server
```



基于流的操作在响应中自然家了chunked	

```js
createReadStream(absolutePath).pipe(res)
```



![image-20210606165328243](http://picbed.sedationh.cn/image-20210606165328243.png)



如果是通过一次end回res

![image-20210606165705905](http://picbed.sedationh.cn/image-20210606165705905.png)



/bin/static-server.js

```js
#!/usr/bin/env node

const path = require('path')
const chalk = require('chalk')
const { program } = require('commander')
const pkg = require(path.join(__dirname, '..', 'package.json'))
const StaticServer = require('../index.js')

const DEFAULT_PORT = 3000

program
  .version(pkg.name + '@' + pkg.version)
  .usage('<root_path> [options]')
  .option(
    '-p, --port <n>',
    'the port to listen to for incoming HTTP connections',
    DEFAULT_PORT
  )
  .parse(process.argv)

const rootPath = path.resolve(process.argv[2] || '')

const options = {
  ...program.opts(),
  rootPath,
}

const server = new StaticServer(options)

server.start(() => {
  console.log(chalk.blue('*'), 'Static server successfully started.')
  console.log(
    chalk.blue('*'),
    'Serving files at:',
    chalk.cyan(`http://localhost:${options.port}`)
  )
  console.log(
    chalk.blue('*'),
    'Press',
    chalk.yellow.bold('Ctrl+C'),
    chalk.red.bold('to shutdown.')
  )

  return server
})
```



/index.js

```js
const http = require('http')
const fs = require('fs/promises')
const url = require('url')
const path = require('path')
const { createReadStream } = require('fs')
const mime = require('mime')

class StaticServer {
  constructor(options) {
    this.port = options.port
    this.rootPath = options.rootPath
  }

  start(callback) {
    http
      .createServer(requestHandler.bind(this))
      .listen(this.port, callback)
  }
}

let cnt = 0

async function requestHandler(req, res) {
  // 收到请求
  const urlObj = url.parse(decodeURIComponent(req.url))

  // 根据请求内容进行相应
  let absolutePath = path.join(this.rootPath, urlObj.path)
  console.log(absolutePath)
  // 拿到相关内容

  try {
    const stat = await fs.stat(absolutePath)
    if (stat.isDirectory()) {
      absolutePath += 'index.html'
    }
    // 处理到这里要么文件不存在，要么就有这个文件
    createReadStream(absolutePath).pipe(res)
    // res.end(await fs.readFile(absolutePath).toString())
    res.setHeader(
      'Content-Type',
      mime.getType(path.extname(absolutePath).slice(1))
    )
  } catch (error) {
    console.log(cnt++, error)
  }
}

module.exports = StaticServer

```

![image-20210606171442886](http://picbed.sedationh.cn/image-20210606171442886.png)

测试通过

