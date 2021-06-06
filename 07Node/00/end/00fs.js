const fs = require('fs/promises')
const path = require('path')

// 传入指令目录 相对 or 绝对
// node 01 path

const inputPath = process.argv[2]
const finalPath = path.resolve(inputPath)

;(async () => {
  const size = await core(finalPath)
  console.log(size)
})()

async function core(rootItemPath) {
  const fileSizes = new Map()
  await processItem(rootItemPath)

  return Array.from(fileSizes.values()).reduce((prev, curr) => {
    return prev + curr
  }, 0)

  async function processItem(itemPath) {
    const stats = await fs.lstat(itemPath)
    fileSizes.set(stats.ino, stats.size)

    if (stats.isDirectory()) {
      const directoryItemPaths = await fs.readdir(itemPath)
      await Promise.all(
        directoryItemPaths.map(directoryItemPath =>
          processItem(path.join(itemPath, directoryItemPath))
        )
      )
    }
  }
}
