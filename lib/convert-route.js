'use strict'

const moment = require('moment-timezone')

const formatTime = (d) => moment(d).tz('Europe/Berlin').format('HH:mm')

const formatDate = (d) => moment(d).tz('Europe/Berlin').format('YYYY-MM-DD')

const formatDuration = (ms) => {
  const d = moment.duration(ms)
  return [
    ('0' + d.asMinutes()).slice(-2),
    ('0' + d.seconds()).slice(-2)
  ].join(':')
}

const convertRoute = (route) => {
  const firstPart = route.parts[0]
  const firstWaypoint = {
    location: firstPart.from.name,
    arriveTime: null,
    arriveDate: null,
    departTime: formatTime(firstPart.start),
    departDate: formatDate(firstPart.start),
    trainId: firstPart.product.line || firstPart.product.name
  }

  return {
    departTime: formatTime(route.start),
    departDate: formatDate(route.start),
    arriveTime: formatTime(route.end),
    arriveDate: formatDate(route.end),
    waypoints: [
      firstWaypoint,
      ...route.parts.map((part, i, parts) => {
        const nextPart = parts[i + 1]
        return {
          location: part.to.name,
          arriveTime: formatTime(part.end),
          arriveDate: formatDate(part.end),
          departTime: nextPart ? formatTime(nextPart.start) : null,
          departDate: nextPart ? formatDate(nextPart.start) : null,
          trainId: part.product.line || part.product.name
        }
      })
    ],
    duration: formatDuration(route.end - route.start),
    priceEUR: route.price.amount,
    platformDep: route.from.platform || null,
    platformArr: route.to.platform || null
  }
}

module.exports = convertRoute
