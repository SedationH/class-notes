const path = require('path')

console.log('__filename', __filename)
// __filename /Users/sedationh/workspace/current/class-notes/07Node/00/01.js

/**
 * 1. 获取路径的基础名称 basename 获取最后一个文件(夹)
 *
 * 文件
 *  可以通过第二个参数去除ext
 */
;(function () {
  console.log(path.basename(__filename))
  // 01.js
  console.log(path.basename(__filename, '.s'))
  console.log(path.basename(__filename, 's'))
  // 01.js
  // 01.j
  console.log(path.basename('/a/b'))
  console.log(path.basename('/a/b/'))
  // b
  // b
})

/**
 * 2. 路径名
 * 其实就是 basename 剩下的
 */
;(function () {
  console.log(path.dirname(__filename))
  console.log(path.dirname('/a/b/'))
  console.log(path.dirname('/a/b'))
  // /Users/sedationh/workspace/current/class-notes/07Node/00
  // /a
  // /a
})

/**
 * 3. ext
 */
;(function () {
  console.log(path.extname('/a/b')) // ""
  console.log(path.extname('a.cas.ss')) // .ss
  console.log(path.extname('a.cas.')) // .
})

// 4. 解析路径
;(function () {
  console.log(path.parse(__filename))
  // {
  //   root: '/',
  //   dir: '/Users/sedationh/workspace/current/class-notes/07Node/00',
  //   base: '01.js',
  //   ext: '.js',
  //   name: '01'
  // }

  console.log(path.parse(__dirname))
  // {
  //   root: '/',
  //   dir: '/Users/sedationh/workspace/current/class-notes/07Node',
  //   base: '00',
  //   ext: '',
  //   name: '00'
  // }

  console.log(path.parse('./a/b.js'))
  // { root: '', dir: './a', base: 'b.js', ext: '.js', name: 'b' }
})

// 5. stringfy
;(function () {
  const pathObj = path.parse('./a/b.js')
  console.log(path.format(pathObj))
  // ./a/b.js
})

// 6. isAbsolute

// 7. 路径拼接
;(function () {
  // 平台相关
  console.log(path.join('a/b', 'c', '../', 'index.html'))
  // a/b/index.html
  console.log(path.join()) // .
})

// 8. 规范路径
;(function () {
  console.log(path.normalize('a/b///c/../d'))
  // a/b/d
})()

// 9. 绝对路径
// The given sequence of paths is processed from right to left
// , with each subsequent path prepended until an absolute path is constructed.
;(function () {
  // 进入不同的工作目录执行脚本
  // /Users/sedationh/workspace/current/class-notes/07Node
  // /Users/sedationh/workspace/current/class-notes/07Node/a
  // /Users/sedationh/workspace/current/class-notes/07Node/00
  // /Users/sedationh/workspace/current/class-notes/07Node/00/a
  console.log(process.cwd())
  console.log(path.resolve('a'))
  // 可见、如果输入的拼接不上，就用process.cwd()
  // 一旦拼接好，就不用left那边的了
  console.log(path.resolve('/z', '/c', 'b', '../a'))
  // /c/a
})
