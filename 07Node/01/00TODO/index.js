const express = require('express')
const fs = require('fs/promises')

const app = new express()


// 处理body contnt-type 为 application/json的情况
app.use(express.json())

app.get('/todos', async (req, res) => {
  try {
    const data = await fs.readFile('./db.json')
    const db = JSON.parse(data)
    res.status(200).json(db.todos)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

app.get('/todos/:id', async (req, res) => {
  try {
    const data = await fs.readFile('./db.json')
    const db = JSON.parse(data)
    const todo = db.todos.find(todo => todo.id === req.params.id)
    if (todo) {
      res.status(200).json(todo)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
})

app.patch('/todos/:id', (req, res) => {
  res.send('patch /todos:id')
})

app.delete('/todos/:id', (req, res) => {
  res.send('delete /todos:id')
})

app.listen(3000, (req, res) => {
  console.log(`TODO Server is running on: http://localhost:3000`)
})
