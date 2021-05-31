// process能拿到啥？

// 1 资源
;(function () {
  console.log(process.memoryUsage())
  // {
  //   rss: 20467712,
  //   heapTotal: 4993024,
  //   heapUsed: 3058808, # 使用内存
  //   external: 1086084, # 引用c++模块
  //   arrayBuffers: 10042
  // }

  console.log(process.cpuUsage())
  // { user: 43425, system: 8879 }
})

// 2. 运行环境
;(function () {
  // node 执行的位置
  console.log(process.cwd())
  // /Users/sedationh/workspace/current/class-notes

  console.log(process.versions)
  // {
  //   node: '14.15.5',
  //   v8: '8.4.371.19-node.18',
  //   uv: '1.40.0',
  //   zlib: '1.2.11',
  //   brotli: '1.0.9',
  //   ares: '1.16.1',
  //   modules: '83',
  //   nghttp2: '1.41.0',
  //   napi: '7',
  //   llhttp: '2.1.3',
  //   openssl: '1.1.1i',
  //   cldr: '37.0',
  //   icu: '67.1',
  //   tz: '2020a',
  //   unicode: '13.0'
  // }

  console.log(process.arch) // x64

  console.log(process.env) // 许多、比如用户的PATH...
  console.log(process.platform) // darwin
})

// 3. 运行状态 启动参数 PID 运行时间
;(function () {
  console.log(process.argv)
  // nodemon 07Node/00/00.js 1 2 3
  // [
  //   '/Users/sedationh/.nvm/versions/node/v14.15.5/bin/node',
  //   '/Users/sedationh/workspace/current/class-notes/07Node/00/00.js',
  //   '1',
  //   '2',
  //   '3'
  // ]

  console.log(process.execArgv)
  // node --harmony 00.js --version
  // [ '--harmony' ]

  console.log(process.pid) // 15192

  setTimeout(() => {
    console.log(process.uptime()) // 3.051478267
  }, 3000)
})

// 4、事件
;(function () {
  process.on('exit', code => {
    console.log(`exit: ${code}`)
  })

  process.on('beforeExit', code => {
    console.log(`beforeExit: ${code}`)
  })

  console.log('end code')
  // process.exit()
})

// 5. 标准输入输出
;(function () {
  console.log = function (data) {
    process.stdout.write('---' + data + '\n')
  }

  console.log(1)
  console.log(2)

  const fs = require('fs')
  fs.createReadStream('test').pipe(process.stdout)

  process.stdin.pipe(process.stdout)

  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    let chunk = process.stdin.read()
    if (chunk !== null) {
      process.stdout.write('数据来咯: ' + chunk)
    }
  })
})()
