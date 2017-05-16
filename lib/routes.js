'use strict'

const hafas = require('db-hafas')
const convertRoute = require('./convert-route')

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

const parseWhen = (w) => {
  if (isNumber.test(w)) w = parseInt(w)
  w = new Date(w * 1000)
  if (Number.isNaN(+w)) return null // invalid date
  return w
}

const isNumber = /^\d+$/

const routes = (req, res, next) => {
  const start = parseLocation(req.query, 'start')
  if (!start) return next(err400('Invalid start parameter.'))
  const end = parseLocation(req.query, 'end')
  if (!end) return next(err400('Invalid end parameter.'))
  const when = parseWhen(req.query.when)
  if (!when) return next(err400('Invalid when parameter.'))

  hafas.routes(start, end, {when})
  .then((routes) => {
    res.json({error: false, data: routes.map(convertRoute)})
  })
  .catch(next)
}

module.exports = routes
