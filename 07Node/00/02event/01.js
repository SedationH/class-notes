const EventEmitter = require('events')

;(function () {
  const ev = new EventEmitter()
  const e1_1 = () => {
    console.log('e1 1')
  }
  ev.once('e1', e1_1)

  ev.on('e1', () => {
    console.log('e1 2')
  })

  // ev.off('e1', e1_1)

  ev.emit('e1')
})

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
