## 模块化

CommonJS 规范

- 模块引用 require
- 模块定义 export
- 模块标示 



Module 模块信息的数据结构

require 接受标识符、加载目标模块

exports module.exports 导出



同步加载



## Module 分析

```js
// 01.js
const m = require('./m')

// m.js
require('./child')

module.exports = {
  add: function () {},
  foo: 'foo',
}

console.log(module)

// child.js
exports.name = 'child'
exports.age = '12'
```

```js
Module {
  id: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/m.js',
  path: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module',
  exports: { add: [Function: add], foo: 'foo' },
  parent: Module {
    id: '.',
    path: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module',
    exports: {},
    parent: null,
    filename: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/01.js',
    loaded: false,
    children: [ [Circular *1] ],
    paths: [
      '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/node_modules',
      '/Users/sedationh/workspace/current/class-notes/07Node/00/node_modules',
      '/Users/sedationh/workspace/current/class-notes/07Node/node_modules',
      '/Users/sedationh/workspace/current/class-notes/node_modules',
      '/Users/sedationh/workspace/current/node_modules',
      '/Users/sedationh/workspace/node_modules',
      '/Users/sedationh/node_modules',
      '/Users/node_modules',
      '/node_modules'
    ]
  },
  filename: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/m.js',
  loaded: false,
  children: [
    Module {
      id: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/child.js',
      path: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module',
      exports: [Object],
      parent: [Circular *1],
      filename: '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/child.js',
      loaded: true,
      children: [],
      paths: [Array]
    }
  ],
  paths: [
    '/Users/sedationh/workspace/current/class-notes/07Node/00/01module/node_modules',
    '/Users/sedationh/workspace/current/class-notes/07Node/00/node_modules',
    '/Users/sedationh/workspace/current/class-notes/07Node/node_modules',
    '/Users/sedationh/workspace/current/class-notes/node_modules',
    '/Users/sedationh/workspace/current/node_modules',
    '/Users/sedationh/workspace/node_modules',
    '/Users/sedationh/node_modules',
    '/Users/node_modules',
    '/node_modules'
  ]
}
```



抽象来看、数据如下

```typescript
interface Module {
  id: string
  path: string
  exports: any
  parent: Module | null
  filename: string
  loaded: boolean
  children: Array<Module>
  paths: Array<string>
}
```



module.exports 和 exports的关系



exports是用来方便导出的

实现相当于

```js
exports = module.exports
```

require导入的时候，使用的是module.exports



require.main 可以得到入口文件

## 理解同步加载

TODO : 对比import这里 ( 目前测试一个样子 )



把require理解成函数执行就好



## 模块的分类和加载流程

- 内置模块
  - 源码中，不用走完整的加载流程
- 文件模块
  - 路径分析
  - 文件类型
    - (m) 
      - m.js m.json m.node
      - 目录 查找 package.json -> "main": value
      - index
  - 编译执行
    - js 
      - fs得到 plainText
      - wrap plainText -> Function -> executable function
      - function args get exports module reuqire... 等值
    - json
      - JSON.parse



缓存优先原则

对加载过后的模块添加index，再次引入的时候使用缓存



## 源码 require过程分析

vscode lanch.json

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        // "<node_internals>/**"
      ],
      "program": "${workspaceFolder}/07Node/00/01module/02debug.js",
      "outFiles": ["${workspaceFolder}/**/*.js"]
    }
  ]
}
```



require 函数 

```js
// Loads a module at the given file path. Returns that module's
// `exports` property.
Module.prototype.require = function(id) {
  validateString(id, 'id');
  if (id === '') {
    throw new ERR_INVALID_ARG_VALUE('id', id,
                                    'must be a non-empty string');
  }
  requireDepth++;
  try {
    return Module._load(id, this, /* isMain */ false);
  } finally {
    requireDepth--;
  }
};
```



内部的load函数

```js
// Check the cache for the requested file.
// 1. If a module already exists in the cache: return its exports object.
// 2. If the module is native: call
//    `NativeModule.prototype.compileForPublicLoader()` and return the exports.
// 3. Otherwise, create a new module for the file and save it to the cache.
//    Then have it load  the file contents before returning its exports
//    object.
Module._load = function(request, parent, isMain) {
  let relResolveCacheIdentifier;
```



目前先假设添加新module的情况

![image-20210602213246482](http://picbed.sedationh.cn/image-20210602213246482.png)

```js
Module._load = function(request, parent, isMain) {
	...
	const module = cachedModule || new Module(filename, parent);
  ...
	Module._cache[filename] = module;
	...
  module.load(filename);
```



```js
// Given a file name, pass it to the proper extension handler.
Module.prototype.load = function(filename) {
```

