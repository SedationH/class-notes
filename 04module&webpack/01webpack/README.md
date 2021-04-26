## 模块打包的由来

- ES 兼容问题
- 减少网络请求
- 除了JS以外的文件，也是资源，看作组成应用的模块



Solution: 

1. 支持除了js以外的文件进行打包
2. 新特性编译
3. 模块化JS打包



代码拆分 增量记载

资源模块

所有资源的模块化



## Use

一个简单的使用

webpack.config.js

```js
const path = require('path')

module.exports = {
  // 这个属性有三种取值，分别是 production、development 和 none。
  // 1. 生产模式下，Webpack 会自动优化打包结果；
  // 2. 开发模式下，Webpack 会自动优化打包速度，添加一些调试过程中的辅助；
  // 3. None 模式下，Webpack 就是运行最原始的打包，不做任何额外处理；
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  }
}
```



## 原理

在mode: none模式下查看一下webpack打包原理 [debug](./debug)

![image-20201025164935223](http://picbed.sedationh.cn/image-20201025164935223.png)

modules 是个数组，里面就是包含着模块的函数



r函数起到标记效果，表示这是一个esmodule

![image-20201025165339508](http://picbed.sedationh.cn/image-20201025165339508.png)



webpackBootStrap 就是用来处理依赖和标记的

这样就把所需的函数整合到了一起

以上的内容是webpeck 4 的版本... 5 变了

![image-20201025173637508](http://picbed.sedationh.cn/image-20201025173637508.png)

待我加入了css和file处理后 发现又和4一样了，先理解到这里吧



webpack内部只能处理js assets,别的资源需要各种loader进行实现

更详细的loader原理分析见[debug](./00debug-interpretation)



入口不仅仅可以是js文件，其他文件也可以

逻辑上是通过例如css-loader处理后，在通过style-loader进行js化，实际最终仍然为js



可以通过js的形式进行转化调用的，就转一下再加入dom树就好，如css的处理

不可以的，如下图的文件，就是复制和重定向的问题，还可以使用dataURL进行替代，base64编码等等



所以如果文件也使用（主要是二进制的表示问题）dataURLs进行转换，那么我们就可以使用js完成所有文件资源的表示了



file-loader

![image-20201025172922925](http://picbed.sedationh.cn/image-20201025172922925.png)





**js作驱动整个前端应用**

在js中根据需要动态导入 所需的资源

代码的工作需要特定的资源，因此直接在js文件中建立依赖关系

这样其实挺合理的，这样建立的依赖关系十分明确



## 使用注意

关于文件处理的最佳实践

小文件走dataURLs 减少请求  大文件走file-loader

因为文件太大还用dataURLs进行处理会导致js太大，拖慢运行



## loader

webpack就是一个资源整合器，js是整个整合器的核心，



- 编译转换类
  - css-loader
- 文件操作类
  - file-loader 文件复制 导出访问逻辑
- 代码检查
  - eslint-loader



## Webpack与ES6

webpack只是针对代码里的import & export进行处理，并没有进行对es6代码的转换

可以看到dist/bundle.js中const 等es6特性依然存在

想要处理 使用babel-loader 值得注意的是 babel也只是个平台，注意配置其plugins



## webpack 模块加载方式

- 遵循 ESM import
- CJS require
- AMD define require
- 样式文件中 @import url()
- html中的标签引用资源

webpack会引用相关的loader进行处理



整个工作流程来看，webpack拿到依赖树，对依赖树进行递归遍历，refer `webpack.config.js`中的设置的rules使用相应的loader进行处理



## plugins机制

Loader专注实现资源模块的加载

plugins解决一些除了资源加载外的需要自动化的工作

使用方式

webpack.config.js中

```js
const Xxx = require('xxx')

modules.exports = {
  plugins: [
    // 具体看插件导出啥 一般是类
    // 这就是 new Xxx({options: object})
    xxx
  ]
}
```



## 一些常用的plugins

- clean-webpack-plugin  常用于自动清理dist文件
- html-webpack-plugin

在00 和 01对webpack的使用中，指定webpack打包到dist/bundle.js中，

都是自己写好index,进行硬编码引入的

这样的方式在进行代码分割，生成多个js文件的时候，会很麻烦，而且在日后修改后，又需要再硬编码修改引用，所以更好的方式应该是让这个html在dist中自己生成

其实也就是查文档+配置

[参考下大致使用](./02use-plugins) 



## 实现自己的webpack plugins

先要理解webpack plugins的如何工作的

**Plugins通过钩子机制实现**

Webpack工作的过程中，有很多环节，webpack为这些向外界暴露钩子，外界可以利用钩子来实现对特定环节的逻辑处理

![image-20201026111457445](http://picbed.sedationh.cn/image-20201026111457445.png)



所以在添加plugins才没有强调顺序



[自己实现参考](./02use-plugins/webpack.config.js#L19) 



## 理想的开发环境

1. http服务的方式进行运行
   1. 生产环境状态
   2. ajax之类的api，以file的protocol是不支持的
2. 自动编译和刷新
3. source map支持



2 可以通过 webpack --watch 和 brower-sync --files 来实现，但还是有物理磁盘读写操作，**webpack-dev-server** 可以提供一站式服务，并且相关操作都在内存中，提升开发环境中的构建效率



1另外，使用http服务的一个问题是api的调用和项目部署的地方存在跨域问题，虽然可以通过部署api cors支持来解决，但并不是所有的api都要设计成提供cors服务，这个时候就要proxy一下，让api调用满足同源要求





3 主要是我们在页面中使用的代码都是构建后的，不方便debug，因此引入source map让浏览器可以通过map文件逆向解析出原来的js代码，从而更方便的进行错误定位

js的文末都有一个

```js
//# sourceMappingURL=xxx.js.map
```

浏览器在解析到这里的时候，会根据map逆向解析出原来的js



webpack 有多种sourcemap模式 其中就在 speed & quality中做取舍

[devtool](https://webpack.js.org/configuration/devtool/#devtool)

*We expect a certain pattern when validate devtool name, pay attention and dont mix up the sequence of devtool string. The pattern is:* `[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`*.*



- eval 是否使用eval执行模块代码
- cheap 是否包含行信息
- module 是否能够得到loader处理之前的源代码
- inline对source的处理是dataURLs
- nosources 表示没有源代码 能看到行列信息
- hidden表示不调用source map调用，但是产生文件



以上问题的代码具体实践[参考](./03use-webpack-dev-server)

## 一些有趣的功能

- hrm -> 仅仅替换修改的部分 不刷新页面（导致丢失页面原来的信息） [参考](./04use-hmr)
- 多配置文件，优化生产环境，说白了就是让webpack读取不一样的config文件

说个比较普遍的实现



```js
// webpack.common.js
module.exports = {
	// 这里是通用的配置
}

// webpack.dev.js
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-eval-module-source-map',
})

// webpack.prod.js
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(['public'])
  ]
})

```

使用 `yarn webpack --config webpack.xxx.js` 就好了

- DefinePlugin 是用来注入全局成员的

```js
const webpack = require('webpack')

module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      // 值要求的是一个代码片段
      API_BASE_URL: JSON.stringify('https://api.example.com')
    })
  ]
}
```

- Tree shaking 去除未引用代码

在mode: production中默认开启

其具体实现就是 tree shaking 是配置出来的

```js
module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    concatenateModules: true,
    // 压缩输出结果
    // minimize: true
  }
}
```

值得注意的是，tree shaking是基于module的，如果babel处理了module -> commonjs 可能就失效了 但现在对这个进行了优化 如果引入tree shaking 那么babel就不处理了

- Scope Hoisting

尽量集中不同module的模块

- 副作用 sideEffects 没看明白...

- 代码分割 code splitting

**分包 按需加载**

多入口打包 Mutiple Entry 多页程序

动态打包 这个好灵活啊 主要是利用

```js
import(/* webpackChunkName: 'b' */'./album/album').then(({ default: album }) => {
  mainElement.appendChild(album())
})
```

来实现的 import -> Promise then ...

```zsh
├── dist
│   ├── a.bundle.js 可以只使用注释内容指定输出文件名
│   ├── a~b.bundle.js 公共文件
│   ├── b.bundle.js
│   ├── index.html
│   └── main.bundle.js
├── package.json
├── src
│   ├── album
│   │   ├── album.css
│   │   └── album.js
│   ├── common
│   │   ├── fetch.js
│   │   └── global.css
│   ├── index.html
│   ├── index.js
│   └── posts
│       ├── posts.css
│       └── posts.js
├── webpack.config.js
└── yarn.lock
```

- Hash 文件名

静态资源缓存 -> 缓存策略不确定 -> 利用文件Hash实现全新的文件全新的情况，搭配长时间缓存就完事了

有全局 hash \  chrunk hash \ **content hash** 的区别

最后一个是根据文件内容产生的哈希，比较好用



```js
output: {
  filename: '[name]-[contenthash:8].bundle.js'
},
```



## rullup & Pacel

输出结果更加扁平

打包结果可读性更好

仅支持esm

开发框架 -> Rollup

感觉还是webpack香



**Pacel** 才是真的爽 爱了爱了

## ESLint

Lint 原来c用来处理compile中无法发现的问题 后来用lint代指代码规范检查

## Prettier

用来格式化的 vscode 实质上就是利用Prettier运行，并且进行指令简化了

## git-hooks

指定在git执行特定指令的时候，执行某些指令

常用的就是pre-commit，进行link 

`.git/pre-hooks` 中编写shell脚本来实现需求，但是不会shell咋办呢

npm i husky -D



`package.json`

```json
{
  "script": {
    "precommit": "lint-staged"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run precommit"
    }
  },
  "lint-staged"; {
  "*.js": [
  	"eslint",
  	"git add ."
  ]
}
}
```

