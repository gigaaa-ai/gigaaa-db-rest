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

const convertJourney = (route) => {
  const firstPart = route.parts[0]
  const firstWaypoint = {
    location: firstPart.origin.name,
    arriveTime: null,
    arriveDate: null,
    departTime: formatTime(firstPart.departure),
    departDate: formatDate(firstPart.departure),
    trainId: firstPart.line.name || null
  }

  return {
    departTime: formatTime(route.departure),
    departDate: formatDate(route.departure),
    arriveTime: formatTime(route.arrival),
    arriveDate: formatDate(route.arrival),
    waypoints: [
      firstWaypoint,
      ...route.parts.map((part, i, parts) => {
        const nextPart = parts[i + 1]
        return {
          location: part.destination.name,
          arriveTime: formatTime(part.arrival),
          arriveDate: formatDate(part.arrival),
          departTime: nextPart ? formatTime(nextPart.departure) : null,
          departDate: nextPart ? formatDate(nextPart.departure) : null,
          trainId: part.line.name || null
        }
      })
    ],
    duration: formatDuration(new Date(route.arrival) - new Date(route.departure)),
    priceEUR: route.price.amount,
    platformDep: route.origin.platform || null,
    platformArr: route.destination.platform || null
  }
}

module.exports = convertJourney
