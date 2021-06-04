const vm = require('vm')
let localVar = 'initial value'

const vmResult = vm.runInThisContext('localVar = "vm";')
console.log(`vmResult: '${vmResult}', localVar: '${localVar}'`)
// Prints: vmResult: 'vm', localVar: 'initial value'

const evalResult = eval('localVar = "eval";')
console.log(`evalResult: '${evalResult}', localVar: '${localVar}'`)
// Prints: evalResult: 'eval', localVar: 'eval'

const eval2 = eval('"use strict";var hi = "eval"')