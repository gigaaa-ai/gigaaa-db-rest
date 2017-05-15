'use strict'

const hafas = require('db-hafas')

const err400 = (msg) => {
  const err = new Error(msg)
  err.statusCode = 400
  return err
}

const parseLocation = (q, type) => {
  if (q[type]) { // station id
    const id = parseInt(q[type])
    return Number.isNaN(id) ? null : id
  }
  if (q[type + '.latitude'] && q[type + '.longitude']) {
    const l = {
      type: 'address',
      name: 'foo bar', // todo
      latitude: +q[type + `.latitude`],
      longitude: +q[type + `.longitude`]
    }
    if (q[type + '.name']) l.name = q[type + '.name']
    if (q[type + '.id']) {
      l.type = 'poi'
      l.id = q[type + '.id']
    }
    return l
  }
  return null
}

const routes = (req, res, next) => {
  const start = parseLocation(req.query, 'start')
  if (!start) return next(err400('Invalid start parameter.'))
  const end = parseLocation(req.query, 'end')
  if (!end) return next(err400('Invalid end parameter.'))

  hafas.routes(start, end)
  .then((routes) => {
    res.json({error: false, data: routes})
  })
  .catch(next)
}

module.exports = routes
