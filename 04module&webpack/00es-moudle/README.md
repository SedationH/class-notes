## 模块化开发

背景，前端开发代码量扩大，在JS方面，使用模块化的规范进行管理。

> **模块化**（modular）编程，是强调将计算机程序的功能分离成独立的、可相互改变的“[模块](https://zh.wikipedia.org/wiki/軟體模組)”（module）的[软件设计](https://zh.wikipedia.org/wiki/软件设计)技术，它使得每个模块都包含着执行预期功能的一个唯一方面（aspect）所必需的所有东西。
>
> 模块接口表达了这个模块所提供的和所要求的元素。这些在接口中定义的元素可以被其他模块检测。

可知，模块化是一种开发范式，方便开发者维护代码。



## 原始时代

JS开始的设计并不支持，前期的一些实现

1. 约定命名，进行导入，可还是没有私有空间，一样会产生冲突
2. js 文件里用object来实现命名空间，还是不私有

```js
// module a 相关状态数据和功能函数
// file: module-a.js

var moduleA = {
  name: 'module-a',

  method1: function () {
    console.log(this.name + '#method1')
  },

  method2: function () {
    console.log(this.name + '#method2')
  }
}

// file: index.html
<script src="module-a.js"></script>
<script src="module-b.js"></script>
<script>
  moduleA.method1()
  moduleB.method1()
  // 模块成员可以被修改
  moduleA.name = "foo"
</script>
```

3. IIFE

利用立刻执行函数，在全局规定的对象上暴露方法，JS中，函数会创建自己的执行上下文，这样就与全局的执行上下文，又或者说变量空间，区分开了。

```js
// module a 相关状态数据和功能函数

;(function () {
  var name = 'module-a'
  
  function method1 () {
    console.log(name + '#method1')
  }
  
  function method2 () {
    console.log(name + '#method2')
  }

  window.moduleA = {
    method1: method1,
    method2: method2
  }
})()

<script src="module-a.js"></script>
<script src="module-b.js"></script>
<script>
  moduleA.method1()
  moduleB.method1()
  // 模块私有成员无法访问
  console.log(moduleA.name) // => undefined
</script>
```



在没有工具和规范的情况下，上面就是使用的模块化开发的具体方案

- 依靠约定
- 需要自己引入script标签进行模块引用



## 步入规范

解决

- 模块化的标准
- 模块加载器

[参考](https://juejin.im/post/6844903744518389768#heading-7)

### CommonJS

CommonJS是为Node设计的

Node应用由模块组成，采用CommonJS规范。每个文件是一个模块，有着自己的作用域。

在服务端，Node同步加载，这一特点，在Web上使用的时，性能体验很拉胯

Node在启用的时候同步加载模块，运行的时候只使用模块

> Specification described above imposes certain requirements — CommonJS modules must be loaded simultaneously. This requirement is well suited for JavaScript, running on the server side. However, it is problematic for browsers where such an approach would cause problems such as interface blocking. 

简单使用

```js
// main.js
const a = require('./module')

// module.js
module.exports = {
  name: "module.js"
}
```



相关实现逻辑如下

```js
let module = {
  exports: {}
}
let exports = module.exports
```

在我们require的时候

```js
const a = require('./a')
// 相当于 module是来自文件的
a = module.exports
// 所以，文件中自动生成的exports只是用于辅助module.exports
// 真正用于导出内容的，还是module.exports
```

### AMD(Asynchronous module definition)

AMD 应对Web场景下异步需求的规范模块化解决方案(Node也能用)

⚠️AMD是specification，不是具体实现

> A **specification** often refers to a set of documented requirements to be satisfied by a material, design, product, or service.[[1\]](https://en.wikipedia.org/wiki/Specification_(technical_standard)#cite_note-1) A specification is often a type of [technical standard](https://en.wikipedia.org/wiki/Technical_standard).

参看Wki，感觉说的很好了

> **Asynchronous module definition** (**AMD**) is a [specification](https://en.wikipedia.org/wiki/Specification_(technical_standard)) for the programming language [JavaScript](https://en.wikipedia.org/wiki/JavaScript). It defines an [application programming interface](https://en.wikipedia.org/wiki/Application_programming_interface) (API) that defines [code modules](https://en.wikipedia.org/wiki/Modular_programming) and their [dependencies](https://en.wikipedia.org/wiki/Coupling_(computer_programming)), and loads them asynchronously if desired. Implementations of AMD provide the following benefits:
>
> - Website performance improvements. AMD implementations load smaller JavaScript files, and then only when they are needed.
> - Fewer page errors. AMD implementations allow developers to define dependencies that must load before a module is executed, so the module does not try to use outside code that is not available yet.
>
> In addition to loading multiple JavaScript files at runtime, AMD implementations allow developers to encapsulate code in smaller, more logically-organized files, in a way similar to other programming languages such as [Java](https://en.wikipedia.org/wiki/Java_(programming_language)). For production and deployment, developers can [concatenate](https://en.wikipedia.org/wiki/Concatenation) and [minify](https://en.wikipedia.org/wiki/Minification_(programming)) JavaScript modules based on an AMD API into one file, the same as traditional JavaScript.
>
> AMD provides some [CommonJS](https://en.wikipedia.org/wiki/CommonJS) interoperability. It allows for using a similar `exports` and `require()` interface in the code, although its own `define()` interface is more basal and preferred.[[1\]](https://en.wikipedia.org/wiki/Asynchronous_module_definition#cite_note-1) **Universal module definition** (**UMD**) is a variant paradigm that takes advantage of these commonalities to support both AMD and CommonJS.[[2\]](https://en.wikipedia.org/wiki/Asynchronous_module_definition#cite_note-2)
>
> The AMD specification is implemented by [Dojo Toolkit](https://en.wikipedia.org/wiki/Dojo_Toolkit), [RequireJS](https://en.wikipedia.org/w/index.php?title=RequireJS&action=edit&redlink=1), and other libraries.

具体的implement such as RequireJS



**DOESN'T NODE ALREADY HAVE A MODULE LOADER?**

> Yes [Node](http://nodejs.org/) does. That loader uses the CommonJS module format. The CommonJS module format is [non-optimal for the browser](https://requirejs.org/docs/why.html), and I do not agree with [some of the trade-offs made in the CommonJS module format](http://tagneto.blogspot.com/2010/03/commonjs-module-trade-offs.html). By using RequireJS on the server, you can use one format for all your modules, whether they are running server side or in the browser. That way you can preserve the speed benefits and easy debugging you get with RequireJS in the browser, and not have to worry about extra translation costs for moving between two formats.
>
> If you want to use define() for your modules but still run them in Node without needing to run RequireJS on the server, see [the section below](https://requirejs.org/docs/node.html#nodeModules) about using [amdefine](https://github.com/jrburke/amdefine).

发现其实[RequireJS官网](https://requirejs.org/docs/node.html)对Web Modules & AMD 说的已经很给力了



这里其实就在说痛点

> How are pieces of JavaScript code defined today?
>
> - Defined via an immediately executed factory function.
> - References to dependencies are done via global variable names that were loaded via an HTML script tag.
> - The dependencies are very weakly stated: the developer needs to know the right dependency order. For instance, The file containing Backbone cannot come before the jQuery tag.
> - It requires extra tooling to substitute a set of script tags into one tag for optimized deployment.



有个问题，js请求比较多



大概知道设计和背景就好了，之外还有CMD 不提了，都是历史的产物了。



## 模块化标准规范

目前规则比较统一了

Web -> ES Module

Node -> CommonJS



## ES Module(ESM)

特性

1. 默认使用严格模式
2. 每个ESM模块都是单独的私有作用域
3. ESM是通过CORS请求外部JS模块的，这里不大明白，是要支持请求的服务设置跨域请求嘛？
4. 默认defer

> This attribute must not be used if the `src` attribute is absent (i.e. for inline scripts), in this case it would have no effect.
>
> The `defer` attribute has no effect on [module scripts ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)— they defer by default.
>
> 关于 defer sync 参考
>
> [Scripts: async, defer](https://javascript.info/script-async-defer)
>
> [这里的配图很给力](growingwiththeweb.com/2014/02/async-vs-defer-attributes.html#script)

```html
<script type="module" src="demo.js"></script>
```



## [export import](https://javascript.info/import-export#a-word-against-default-exports)

Here are all types of `export` that we covered in this and previous articles.

You can check yourself by reading them and recalling what they mean:

- Before declaration of a class/function/…:
  - `export [default] class/function/variable ...`
- Standalone export:
  - `export {x [as y], ...}`.
- Re-export:
  - 本文件的作用域无法访问到了，通常在index模块用于统一导出
  - `export {x [as y], ...} from "module"`
  - `export * from "module"` (doesn’t re-export default).
  - `export {default [as y]} from "module"` (re-export default).

Import:

- Named exports from module:
  - `import {x [as y], ...} from "module"`
- Default export:
  - `import x from "module"`
  - `import {default as x} from "module"`
- Everything:
  - `import * as obj from "module"`
- Import the module (its code runs), but do not assign it to a variable:
  - `import "module"`



值得注意的点

```js
export { a, b } 
// { a, b }并不是一个对象字面量 只是语法上的规则
```



export & import 的位置可以是任意的

 是静态模块管理系统

[参考](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)

 导入成员并不是复制一个副本，
 而是直接导入模块成员的引用地址，
 也就是说 import 得到的变量与 export 导入的变量在内存中是同一块空间。
 一旦模块中成员修改了，这里也会同时修改

[参考](./00attension/app.js) 



注意路径(包括文件后缀)要些完整，不要把CommonJs里的一些习惯带到这里 (很多事关于index的省略)

关于re-export的使用说明

```js
// components/Button.js
export const Button = 'Button Component'

// components/avatar.js
export const Avatar = 'Avatar Component'

// components/index.js
export { Button } from './button.js'
export { Avatar } from './avatar.js'

// app.js
import { Button, Avatar } from 'components/index.js'
```



ES Module Polyfill

```js
<body>
  <script nomodule src="https://unpkg.com/promise-polyfill@8.1.3/dist/polyfill.min.js"></script>
  <script nomodule src="https://unpkg.com/browser-es-module-loader@0.4.1/dist/babel-browser-build.js"></script>
  <script nomodule src="https://unpkg.com/browser-es-module-loader@0.4.1/dist/browser-es-module-loader.js"></script>
  <script type="module">
    import { foo } from './module.js'
    console.log(foo)
  </script>
</body>
```

最终解决方案还是提前进行转换，不放在运行时转换



## ESM in Node runtime

[Differences between ES modules and CommonJS](https://nodejs.org/docs/latest/api/esm.html#esm_differences_between_es_modules_and_commonjs)

> Node.js's native module system is [CommonJs](https://nodejs.org/docs/latest/api/modules.html).
>
> It has experimental support for the standard [ES6 module system](https://nodejs.org/docs/latest/api/esm.html) and using a `.mjs` file extension is part of one way to trigger that support. (As of Node 13, you can trigger support by setting `"type": "module",` in *package.json*).
>
> In short, it is used by Node.js to distinguish between CommonJS and ES6 module files.
>
> See also: [Differences between ES6 module system and CommonJs](https://nodejs.org/docs/latest/api/esm.html#esm_differences_between_es_modules_and_commonjs)

node环境还是先用CommonJs吧.. 不折腾



场景

```js
// commonjs.js
module.exports = {
  foo: 'commonjs exports value'
}

// esm.js
import { foo } from './commonjs.js' //err {} 不代表对象结构 只是语法
```



**Summary**

- ES Modules 中可以导入CommonJS模块
- CommonJS中不可以导入 ESM
- CommonJS 通过 import 导入的时候，只能有默认导出
  - improt {} 不是结构对象



## 也可以通过babel-node实现兼容

简述下babel原理

babel基于插件机制实现对于JS的转换

![image-20201024192010105](http://picbed.sedationh.cn/image-20201024192010105.png)

preset则是plugins的集合

