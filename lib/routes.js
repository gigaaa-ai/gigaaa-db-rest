'use strict'

const hafas = require('db-hafas')
const convertJourney = require('./convert-journey')

const err400 = (msg) => {
  const err = new Error(msg)
  err.statusCode = 400
  return err
}

const isNumber = /^\d+$/

const parseLocation = (q, type) => {
  if (q[type]) { // station id
    return isNumber.test(q[type]) ? q[type] : null
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

const routes = (req, res, next) => {
  const start = parseLocation(req.query, 'start')
  if (!start) return next(err400('Invalid start parameter.'))
  const end = parseLocation(req.query, 'end')
  if (!end) return next(err400('Invalid end parameter.'))
  const when = parseWhen(req.query.when)
  if (!when) return next(err400('Invalid when parameter.'))

  hafas.journeys(start, end, {when})
  .then((journeys) => {
    res.json({error: false, data: journeys.map(convertJourney)})
  })
  .catch(next)
}

module.exports = routes
