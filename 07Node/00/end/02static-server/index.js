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
