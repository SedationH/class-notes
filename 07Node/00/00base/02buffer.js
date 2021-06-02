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

// 没有理解场景
// TODO:
;(function () {
  ArrayBuffer.prototype.split = function (separator) {}
})()
