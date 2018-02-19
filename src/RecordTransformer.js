const _ = require('lodash')

module.exports = () => {
  function arrayToNumbers(arr) {
    return arr.map(element => {
      return element.toNumber()
    })
  }

  return {
    'toObject': (record) => {
      const u = record.u.properties
      const name = _.get(u, 'firstName', '') + ' ' + _.get(u, 'lastName', '')

      u.name = name.trim()
      u.id = u.id.toNumber()
      u.availableForFullTime = u.availableForFullTime.toNumber()
      u.availableForFreelance = u.availableForFreelance.toNumber()
      u.availableForInternships = u.availableForInternships.toNumber()
      u.usersFollowing = arrayToNumbers(_.get(record, 'usersFollowing', []))
      u.professionIds = arrayToNumbers(_.get(record, 'professionIds', []))
      u.skillIds = arrayToNumbers(_.get(record, 'skillIds', []))
      u.professions = _.get(record, 'professions', [])
      u.skills = _.get(record, 'skills', [])
      u.projectSkills = _.get(record, 'projectSkills', [])
      u.projectIndustries = _.get(record, 'projectIndustries', [])
      u.industries = _.get(record, 'industries', [])
      u.experiences = _.get(record, 'experiences', [])

      if ('locationLatitude' in u && 'locationLongitude' in u) {
        u.location = { lat: u.locationLatitude, lon: u.locationLongitude }
      }

      if ('searchScore' in u) {
        u.searchScore = u.searchScore.toNumber()
      } else {
        u.searchScore = 0
      }

      if ('level' in u) {
        u.level = u.level.toNumber()
      } else {
        u.level = 0
      }

      if ('profileImage' in u) {
        u.profileImage = `https://images3.the-dots.com/${u.profileImage}?p=profileImage`
      }

      delete u.locationLatitude
      delete u.locationLongitude

      delete u.firstName
      delete u.lastName

      return u
    }
  }
}
