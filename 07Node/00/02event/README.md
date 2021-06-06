## Event

`Events` 是 Node.js 中一个非常重要的 core 模块, 在 node 中有许多重要的 core API 都是依赖其建立的. 比如 `Stream` 是基于 `Events` 实现的, 而 `fs`, `net`, `http` 等模块都依赖 `Stream`, 所以 `Events` 模块的重要性可见一斑.

通过继承 EventEmitter 来使得一个类具有 node 提供的基本的 event 方法, 这样的对象可以称作 emitter, 而触发(emit)事件的 cb 则称作 listener. 与前端 DOM 树上的事件并不相同, emitter 的触发不存在冒泡, 逐层捕获等事件行为, 也没有处理事件传递的方法.

> Eventemitter 的 emit 是同步还是异步?

Node.js 中 Eventemitter 的 emit 是同步的. 在官方文档中有说明:

> The EventListener calls all listeners synchronously in the order in which they were registered. This is important to ensure the proper sequencing of events and to avoid race conditions or logic errors.



从设计模式的角度来看，是对观察者模式的运用，是一种构建不同对象间通讯关系的一种机制



大致API

on (addListener)

emit

off (removeListener)

once

...



下面的思路是先看源码，再尝试简单实现


## 源码调试

```js
const ev = new EventEmitter() // <- debug
ev.on('e1', () => {
  console.log('e1 1')
})

ev.on('e1', () => {
  console.log('e1 2')
})

ev.emit('e1')
```



```js
function EventEmitter(opts) {
  EventEmitter.init.call(this, opts);
}

EventEmitter.init = function(opts) {

  if (this._events === undefined ||
      this._events === ObjectGetPrototypeOf(this)._events) {
    this._events = ObjectCreate(null);
    this._eventsCount = 0;
  }
	...
```

初始化event 值得注意的是使用了ObjectCreate(null) 来减少原型链



下面进入 on 

```js
ev.on('e1', () => {
  console.log('e1 1')
})

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

function _addListener(target, type, listener, prepend) {
  let m;
  let events;
  let existing;
  ...
      existing = events[type];
  ...
  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }
```

从这里可见第一次传入是直接 `key : function`的 方式处理events对象

后面再换为` key : Array<function>`

```js
function _addListener(target, type, listener, prepend) {
  let m;
  let events;
  let existing;
  ...
	return target;
```

返回的还是new EventEmitter出来的对象

因此可以链式调用



进入emit

```js
ev.emit('e1')

EventEmitter.prototype.emit = function emit(type, ...args) {
  let doError = (type === 'error');

  const events = this._events;
  ...
  const handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    const result = ReflectApply(handler, this, args);

    // We check if result is undefined first because that
    // is the most common case so we do not pay any perf
    // penalty
    if (result !== undefined && result !== null) {
      addCatch(this, result, type, args);
    }
  } else {
    const len = handler.length;
    const listeners = arrayClone(handler);
    for (let i = 0; i < len; ++i) {
      const result = ReflectApply(listeners[i], this, args);

      // We check if result is undefined first because that
      // is the most common case so we do not pay any perf
      // penalty.
      // This code is duplicated because extracting it away
      // would make it non-inlineable.
      if (result !== undefined && result !== null) {
        addCatch(this, result, type, args);
      }
    }
  }

  return true;
}
```

首先，emit返回的结果是Bolean类型，表示触发成功或失败

针对不同的handler类型进行区别处理

其中的arrayClone是一个shadow clone的过程

这里注意⚠️克隆是为了防止emit过程中产生的off行为干扰emit过程



```js
    const listeners = arrayClone(handler);

// -> 

function arrayClone(arr) {
  // At least since V8 8.3, this implementation is faster than the previous
  // which always used a simple for-loop
  switch (arr.length) {
    case 2: return [arr[0], arr[1]];
    case 3: return [arr[0], arr[1], arr[2]];
    case 4: return [arr[0], arr[1], arr[2], arr[3]];
    case 5: return [arr[0], arr[1], arr[2], arr[3], arr[4]];
    case 6: return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]];
  }
  return arr.slice();
}
```

hh，这里的arrayClone实现挺有意思

从

```js
      const result = ReflectApply(listeners[i], this, args);
// 这里进入我们自己写的cb执行
```

![image-20210604141339089](http://picbed.sedationh.cn/image-20210604141339089.png)

但因为传入的箭头函数没有this

普通函数中的this应该是ev实例



再来看看off的过程

```js
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      checkListener(listener);

      const events = this._events;
      if (events === undefined)
        return this;

      const list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = ObjectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        let position = -1;

        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          if (spliceOne === undefined)
            spliceOne = require('internal/util').spliceOne;
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, listener);
      }

      return this;
    };
```

首先 和 on 一样，都是返回this，也说明可以链式调用，其他处理思路与on类似

留意一下

` if (list[i] === listener || list[i].listener === listener) {`这个判定，后面list[i].listener在处理once的时候回用到



从删除这里也可以看出最终`_events`中的数据情况

有相关的type 要么 对应有一个函数，要么对应多个函数组成的数组

如果一个没有，type会被delete掉



每次只删除一个？



once

```js
const e1_1 = () => {
  console.log('e1 1')
}
ev.once('e1', e1_1)

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);

  this.on(type, _onceWrap(this, type, listener));
  return this;
};

function _onceWrap(target, type, listener) {
  const state = { fired: false, wrapFn: undefined, target, type, listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}
```

可见是包装了一个函数

在原先的函数外面套了一层，向on上绑定的也是套壳函数

这个套壳函数在执行的时候

会通过 `this.target.removeListener(this.type, this.wrapFn);`把绑定在`_events`上的对应的type的warpFn去除

![image-20210604144307498](http://picbed.sedationh.cn/image-20210604144307498.png)

![image-20210604144321887](http://picbed.sedationh.cn/image-20210604144321887.png)

先去除，再执行



可若是再emit之前又要把once的函数给去除呢？

再回调队列上并不存在原始的函数，只是有个套壳函数

![image-20210604144801391](http://picbed.sedationh.cn/image-20210604144801391.png)

这就是为啥要再包装函数的时候加一个listenter保存初始函数

并且每次在去除的时候都有在寻找`list[i].listener === listener`

```js
for (let i = list.length - 1; i >= 0; i--) {
  if (list[i] === listener || list[i].listener === listener) {
    position = i;
    break;
  }
}
```



ok 源码到这里看的差不多，模拟实现

## 模拟实现

自己写的过程中，感觉 因为once产生的 emit过程中发生off这里不太好处理

又去翻了一下源码过程，才理解arrayClone那里别有深意hhh

```js
class MyEventEmitter {
  constructor() {
    this._events = {}
  }

  on(type, listener) {
    if (this._events[type]) {
      this._events[type].push(listener)
    } else {
      this._events[type] = [listener]
    }
    return this
  }

  emit(type, ...args) {
    const listeners = this._events[type]
    let flag = false

    if (listeners) {
      const len = listeners.length
      const clonedListeners = listeners.slice()
      for (let i = 0; i < len; i++) {
        flag = true
        clonedListeners[i].apply(this, args)
      }
    }
    return flag
  }

  off(type, listener) {
    const listeners = this._events[type]

    if (listeners) {
      const len = listeners.length
      let position = -1
      for (let i = len - 1; i >= 0; i--) {
        if (
          listeners[i] === listener ||
          listeners[i].listener === listener
        ) {
          position = i
          break
        }
      }
      position !== -1 && listeners.splice(position, 1)
    }
    return this
  }

  static _onceWrap(target, type, listener) {
    function wrapedFunction(...args) {
      target.off(type, wrapedFunction)
      listener.apply(target, listener)
    }
    wrapedFunction.listener = listener

    return wrapedFunction
  }

  once(type, listener) {
    this.on(type, MyEventEmitter._onceWrap(this, type, listener))
    return this
  }
}

;(function () {
  const ev = new MyEventEmitter()
  const e1_1 = () => {
    console.log('e1 1')
  }
  ev.once('e1', e1_1)

  ev.on('e1', () => {
    console.log('e1 2')
  })

  ev.off('e1', e1_1)

  ev.emit('e1')
  ev.emit('e1')
})()
```

大功告成～