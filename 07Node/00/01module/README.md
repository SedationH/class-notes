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
  const filename = Module._resolveFilename(request, parent, isMain);
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
  ...
  Module._extensions[extension](this, filename);
```

策略模式，对不同的文件使用不同loader

![image-20210603092027679](http://picbed.sedationh.cn/image-20210603092027679.png)



```js
// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  if (filename.endsWith('.js')) {
    ...
    content = fs.readFileSync(filename, 'utf8');
    ....
  module._compile(content, filename);
```

![image-20210603092422845](http://picbed.sedationh.cn/image-20210603092422845.png)

content中的文件内容就是requrie的源代码



```js
// Run the file contents in the correct scope or sandbox. Expose
// the correct helper variables (require, module, exports) to
// the file.
// Returns exception, if any.
Module.prototype._compile = function(content, filename) {
  ...
  const compiledWrapper = wrapSafe(filename, content, this);
```

![image-20210603092727791](http://picbed.sedationh.cn/image-20210603092727791.png) 

包装函数的获取, 注意包装后的函数有几个参数

exports require module `__dirname ` `__filename`

因为这个原因，module在执行的时候才可以直接拿到他们

```js
// Run the file contents in the correct scope or sandbox. Expose
// the correct helper variables (require, module, exports) to
// the file.
// Returns exception, if any.
Module.prototype._compile = function(content, filename) {
  ...
  const compiledWrapper = wrapSafe(filename, content, this);
  ...
  const dirname = path.dirname(filename);
  const require = makeRequireFunction(this, redirects);
  let result;
  const exports = this.exports;
  const thisValue = exports;
  const module = this;
  if (requireDepth === 0) statCache = new Map();
  if (inspectorWrapper) {
    result = inspectorWrapper(compiledWrapper, thisValue, exports,
                              require, module, filename, dirname);
  } else {
    result = compiledWrapper.call(thisValue, exports, require, module,
                                  filename, dirname);
  }
  ...
  return result
```

因此可知，module在执行的时候this 指向的，就是module.exports

执行compilerWrapper.call...

![image-20210603093342338](http://picbed.sedationh.cn/image-20210603093342338.png)



上述过程中有一处还没看清

就是包装函数`wrapSafe`那里

其使用了`compileFunction`方法

`const { compileFunction } = internalBinding('contextify');`

这是一个内部的方法，关键作用是创建一个virtual box来执行代码

这里的需求是，require的代码的namespace 和 调用require的namespace应该是隔离开的



## compileFunction 分析

包装函数、要分隔作用域、执行函数

1. 从文本内容到可执行函数

使用function进行拼接

```js
"(function (exports, require, module, __filename, __dirname){" + content + "})""
```

2. 分隔作用域

使用`vm.runInThisContext()`

> `vm.runInThisContext()` compiles `code`, runs it within the context of the current `global` and returns the result. Running code does not have access to local scope, but does have access to the current `global` object.
>
> If `options` is a string, then it specifies the filename.
>
> The following example illustrates using both `vm.runInThisContext()` and the JavaScript [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) function to run the same code:

```js
const vm = require('vm');
let localVar = 'initial value';

const vmResult = vm.runInThisContext('localVar = "vm";');
console.log(`vmResult: '${vmResult}', localVar: '${localVar}'`);
// Prints: vmResult: 'vm', localVar: 'initial value'

const evalResult = eval('localVar = "eval";');
console.log(`evalResult: '${evalResult}', localVar: '${localVar}'`);
// Prints: evalResult: 'eval', localVar: 'eval'
```

debug看一下执行流程

debug -> `const vmResult = vm.runInThisContext('localVar = "vm";')`



```js
function runInThisContext(code, options) {
  if (typeof options === 'string') {
    options = { filename: options };
  }
  return createScript(code, options).runInThisContext(options);
}
```

创建 scirpt 再通过 创建的script进行runInThisContext的调用

这个时候的this就指向script

scirpt的`runInThisContext` 重写了继承于`ContextifyScript`的`runInThisContext`

```js
class Script extends ContextifyScript {
  ...
  runInThisContext(options) {
    const { breakOnSigint, args } = getRunInContextArgs(options);
    if (breakOnSigint && process.listenerCount('SIGINT') > 0) {
      return sigintHandlersWrap(super.runInThisContext, this, args);
    }
    return super.runInThisContext(...args);
  }
```

```js
const {
  ContextifyScript,
  MicrotaskQueue,
  makeContext,
  isContext: _isContext,
  constants,
  compileFunction: _compileFunction,
  measureMemory: _measureMemory,
} = internalBinding('contextify');
```

执行这里，进入vm环境

```js
return super.runInThisContext(...args);
```

![image-20210603103217684](http://picbed.sedationh.cn/image-20210603103217684.png)



而在eval中的环境

![image-20210603103329612](http://picbed.sedationh.cn/image-20210603103329612.png)



这里没有使用strict mode

![image-20210603103619250](http://picbed.sedationh.cn/image-20210603103619250.png)

如果使用strict 

![image-20210603103721149](http://picbed.sedationh.cn/image-20210603103721149.png)

会为eval的执行创建相应的eval VO 环境