
module.exports = RecordTransformer = () => {
  function arrayToNumbers(arr) {
    return arr.map(element => {
      return element.toNumber()
    })
  }

  return {
    'toObject': (record) => {
      const createdAt = record.get('createdAt')
      const lastLoginAt = record.get('lastLoginAt')
      const level = record.get('level')
      const searchScore = record.get('searchScore')
      const lat = record.get('locationLatitude')
      const lon = record.get('locationLongitude')

      const user = {
        'id': record.get('id').toNumber(),
        'firstName': record.get('firstName'),
        'lastName': record.get('lastName'),
        'level': level === null ? 0 : level.toNumber(),
        'locationName': record.get('locationName'),
        'profileImage': record.get('profileImage'),
        'searchScore': searchScore === null ? 0 : searchScore.toNumber(),
        'availableForFullTime': record.get('availableForFullTime').toNumber(),
        'availableForFreelance': record.get('availableForFreelance').toNumber(),
        'availableForInternships': record.get('availableForInternships').toNumber(),
        'tagline': record.get('tagline'),
        'projectsCount': record.get('projectsCount').toNumber(),
        'usersFollowing': arrayToNumbers(record.get('usersFollowing')),
        'professionIds': arrayToNumbers(record.get('professionIds')),
        'professions': record.get('professions'),
        'skillIds': arrayToNumbers(record.get('skillIds')),
        'skills': record.get('skills'),
      }

      if (createdAt !== null) {
        user.createdAt = createdAt
      }

      if (lastLoginAt !== null) {
        user.lastLoginAt = lastLoginAt
      }

      if (lat !== null && lon !== null) {
        user.location = { lat: lat, lon: lon }
      }

      return user
    }
  }
}
