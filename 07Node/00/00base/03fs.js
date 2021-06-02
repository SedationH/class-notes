const fs = require('fs')
const path = require('path')

;(function () {
  // 建议都使用绝对路径
  fs.readFile(
    path.resolve(__dirname, 'a'),
    'utf8',
    function (err, data) {
      if (err) {
        console.error(err)
        return
      }
      console.log(data)
    }
  )
})
;(function () {
  const b = Buffer.alloc(3)
  fs.open('a', (err, rfd) => {
    fs.open('b', 'w', (err, wfd) => {
      let readAdnWritePosition = 0
      next()
      function next() {
        fs.read(
          rfd,
          b,
          0,
          b.byteLength,
          readAdnWritePosition,
          (err, bytesRead, buffer) => {
            if (!bytesRead) return

            fs.write(
              wfd,
              b,
              0,
              bytesRead,
              readAdnWritePosition,
              (err, bytesWritten, buffer) => {
                readAdnWritePosition += bytesRead
                console.log(readAdnWritePosition)

                next()
              }
            )
          }
        )
      }
    })
  })
})
;(function () {
  // 实现递归创建文件
  // fs.mkdir(
  //   'aa/bb/cc',
  //   {
  //     recursive: true,
  //   },
  //   err => {
  //     if (err) {
  //       console.log(err)
  //       return
  //     }
  //     console.log('ok')
  //   }
  // )

function mkdir(dirPath, cb) {
  const dirs = dirPath.split('/')
  let index = 0

  next()

  function next() {
    if (index === dirs.length) return cb && cb()
    const current = dirs.slice(0, index + 1).join('/')
    index++
    fs.exists(current, exists => {
      if (exists) {
        next()
      } else {
        fs.mkdir(current, next)
      }
    })
  }
}
  mkdir('aa/bb/cc')
})
