## Node 架构

![image-20210530212227525](http://picbed.sedationh.cn/image-20210530212227525.png)



Natives modules

可以直接调用的库，由JS实现



Bindings 与 c++等较为基础的语言 打交道



V8: 执行JS代码，提供桥梁接口

Libuv: 事件模型



## Why Node

IO 是计算机操作中很慢的环节



传统语言是通过增加线程来处理更多的请求，但其中大多数时间在等待



Node Reactor 模式

异步IO、事件驱动



Node不适合CPU密集型



## How Node 异步 IO

不同的OS下有各自实现非阻塞IO的方式

Libuv相当于对他们抹去平台差异的高层封装



event loop + Libuv一起作用

完成异步IO行为



## 全局对象

```js
;(function () {

  console.log(this == global) // true

})()

console.log(this === global) // false
```

可见模块执行的时候，相当于

moduleFunction.call(module)

## buffer

![image-20210531105826450](http://picbed.sedationh.cn/image-20210531105826450.png)



- Node下二进制操作的相关数据结构
- 不占据V8对内存大小的内存空间
- 使用由Node控制，由v8 GC 进行回收
- 一般配合Stream、充当数据缓冲区



## fs

用户对文件所具备的权限

rwx

421

权限位：

文件所有者、文件所属组、其他用户

```shell
total 48
-rw-r--r--@ 1 sedationh  staff   1.2K May 31 12:27 00.md
-rw-r--r--  1 sedationh  staff   2.2K May 31 10:21 00base.js
-rw-r--r--  1 sedationh  staff   2.6K May 31 10:55 01path.js
-rw-r--r--  1 sedationh  staff   1.3K May 31 12:24 02buffer.js
-rw-r--r--  1 sedationh  staff    50B May 31 12:25 03fs.js
drwxr-xr-x  2 sedationh  staff    64B May 31 12:28 dir # d表示文件夹
-rw-r--r--  1 sedationh  staff    13B May 31 10:12 test
```



常见flag

r w

s sync

\+ 表示相反的操作

x 表示排它操作

a append 追加



几个api

```js
readFile
writeFile
appendFile
copyFile
watchFile
```

上述几个API对数据的处理方式是统一调入内存

这在操作大文件的时候不友好

![image-20210531132552459](http://picbed.sedationh.cn/image-20210531132552459.png)

fd 文件标识符

一般从3开始

0 1 2 分别被 stdin stdout stderror 占用了

```js
open
close

read 磁盘 -> Buffer
write Buffer -> 磁盘
```



```js
const b = Buffer.alloc(3);
fs.open("a", (err, rfd) => {
  fs.open("b", "w", (err, wfd) => {
    let readAdnWritePosition = 0;
    next();
    function next() {
      fs.read(rfd, b, 0, b.byteLength, readAdnWritePosition, (err, bytesRead, buffer) => {
        if (!bytesRead) return;

        fs.write(wfd, b, 0, bytesRead, readAdnWritePosition, (err, bytesWritten, buffer) => {
          readAdnWritePosition += bytesRead;
          console.log(readAdnWritePosition);

          next();
        });
      });
    }
  });
});
```



几个api

```js
rmdir {recursive}
mkdir {recursivi}
readdir

stats 可以获取到文件stats对象 上面有 size isFile() isDirectionary
```



```js
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
```



