const express = require('express')
const { uuid } = require('uuidv4')
const { cors } = require('./lib/middleware')
const router = express.Router()

const todoList = {}
router.use(cors(), (req, res, next) => {
  if (!req.session.username) {
    return res.json({
      error: {
        message: 'user not logged in'
      }
    })
  }
  req.todoList = todoList[req.session.username] || {}
  todoList[req.session.username] = req.todoList
  next()
})

router.get('/api/todos', (req, res) => {
  res.json(Object.values(req.todoList))
})

router.post('/api/todos', (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({
      error: {
        message: 'body text field cannot be empty'
      }
    })
  }
  const id = uuid()
  const todo = {
    id,
    complete: false,
    text: req.body.text,
    createdAt: Date.now()
  }
  req.todoList[id] = todo
  res.json(todo)
})

router.delete('/api/todos/:id', (req, res) => {
  const todo = req.todoList[req.params.id]
  delete req.todoList[req.params.id]
  res.json(todo)
})

router.patch('/api/todos/:id', (req, res) => {
  const todo = req.todoList[req.params.id]
  const acceptable = ['text', 'complete']
  let isInvalid = false
  Object.keys(req.body).forEach((key) => {
    if (!acceptable.includes(key)) {
      isInvalid = `modifying ${key} is not allowed`
    }
    todo[key] = req.body[key]
  })
  if (isInvalid) {
    return res.status(400).json({
      error: {
        message: isInvalid
      }
    })
  }
  res.json(todo)
})

module.exports = router
