'use strict'

const hafas = require('db-hafas')
const convertJourney = require('./convert-journey')
const generateTicketLink = require('generate-db-shop-urls')

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

const fetchTicketLinkForJourney = (j) => {
  return generateTicketLink({
    from: j.origin,
    to: j.destination,
    outbound: {
      departure: j.departure,
      arrival: j.arrival,
      legs: j.parts,
      price: j.price
    }
  })
  .catch(() => null)
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
    return Promise.all(journeys.map(fetchTicketLinkForJourney))
    .then((links) => {
      const data = []
      for (let i = 0; i < links.length; i++) {
        const converted = convertJourney(journeys[i])

        converted.link = links[i]
        data.push(converted)
      }

      res.json({error: false, data})
    })
  })
  .catch(next)
}

module.exports = routes
