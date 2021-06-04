console.log(require('./child'))
// { name: 'child', age: '12' }

module.exports = {
  add: function () {},
  foo: 'foo',
}

let name = 1

setTimeout(() => {
  console.log(name)
}, 1000);
// console.log(module)

console.log('main', require.main)

// Module {
//   id: '/Users/sedationh/workspace/current/class-notes/07Node/01module/m.js',
//   path: '/Users/sedationh/workspace/current/class-notes/07Node/01module',
//   exports: {},
//   parent: Module {
//     id: '.',
//     path: '/Users/sedationh/workspace/current/class-notes/07Node/01module',
//     exports: {},
//     parent: null,
//     filename: '/Users/sedationh/workspace/current/class-notes/07Node/01module/01.js',
//     loaded: false,
//     children: [ [Circular *1] ],
//     paths: [
//       '/Users/sedationh/workspace/current/class-notes/07Node/01module/node_modules',
//       '/Users/sedationh/workspace/current/class-notes/07Node/node_modules',
//       '/Users/sedationh/workspace/current/class-notes/node_modules',
//       '/Users/sedationh/workspace/current/node_modules',
//       '/Users/sedationh/workspace/node_modules',
//       '/Users/sedationh/node_modules',
//       '/Users/node_modules',
//       '/node_modules'
//     ]
//   },
//   filename: '/Users/sedationh/workspace/current/class-notes/07Node/01module/m.js',
//   loaded: false,
//   children: [],
//   paths: [
//     '/Users/sedationh/workspace/current/class-notes/07Node/01module/node_modules',
//     '/Users/sedationh/workspace/current/class-notes/07Node/node_modules',
//     '/Users/sedationh/workspace/current/class-notes/node_modules',
//     '/Users/sedationh/workspace/current/node_modules',
//     '/Users/sedationh/workspace/node_modules',
//     '/Users/sedationh/node_modules',
//     '/Users/node_modules',
//     '/node_modules'
//   ]
// }
