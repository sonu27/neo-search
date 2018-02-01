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

      const createdAt = u.createdAt
      const lastLoginAt = u.lastLoginAt
      const lat = u.locationLatitude
      const lon = u.locationLongitude

      const user = {
        'id': u.id.toNumber(),
        'firstName': u.firstName,
        'lastName': u.lastName,
        'level': _.get(u, 'level', 0),
        'locationName': u.locationName,
        'profileImage': u.profileImage,
        'searchScore': _.get(u, 'searchScore', 0),
        'availableForFullTime': u.availableForFullTime.toNumber(),
        'availableForFreelance': u.availableForFreelance.toNumber(),
        'availableForInternships': u.availableForInternships.toNumber(),
        'tagline': u.tagline,
        'usersFollowing': arrayToNumbers(record.usersFollowing),
        'professionIds': arrayToNumbers(record.professionIds),
        'professions': record.professions,
        'skillIds': arrayToNumbers(record.skillIds),
        'skills': record.skills,
        'industries': record.industries,
        'experiences': record.experiences,
      }

      if ('createdAt' in u) {
        user.createdAt = createdAt
      }

      if ('lastLoginAt' in u) {
        user.lastLoginAt = lastLoginAt
      }

      if ('lat' in u && 'lon' in u) {
        user.location = { lat: lat, lon: lon }
      }

      return user
    }
  }
}
