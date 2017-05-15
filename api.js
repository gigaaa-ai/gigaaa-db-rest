'use strict'

const express = require('express')
const corser = require('corser')
const compression = require('compression')
const nocache = require('nocache')

const pkg = require('./package.json')
const todo = require('./lib/todo')

const api = express()
module.exports = api

const allowed = corser.simpleRequestHeaders.concat(['User-Agent', 'X-Identifier'])
const poweredBy = (req, res, next) => {
  if (!res.headersSent) {
    res.setHeader('X-Powered-By', pkg.name + ' ' + pkg.homepage)
  }
  next()
}

api.use(corser.create({requestHeaders: allowed})) // CORS
api.use(compression())
api.use(nocache())
api.use(poweredBy)

api.get('/todo', todo)

api.use((err, req, res, next) => {
  if (res.headersSent) return next()
  res.status(err.statusCode || 500).json({error: true, msg: err.message})
  next()
})
