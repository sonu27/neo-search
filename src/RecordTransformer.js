
module.exports = RecordTransformer = () => {
  function arrayToNumbers(arr) {
    return arr.map(element => {
      return element.toNumber()
    })
  }

  return {
    'toObject': (record) => {
      let level = record.get('level')
      let searchScore = record.get('searchScore')

      let user = {
        'id': record.get('id').toNumber(),
        'firstName': record.get('firstName'),
        'lastName': record.get('lastName'),
        'level': level == null ? 0 : level.toNumber(),
        'locationLatitude': record.get('locationLatitude'),
        'locationLongitude': record.get('locationLongitude'),
        'locationName': record.get('locationName'),
        'profileImage': record.get('profileImage'),
        'searchScore': searchScore == null ? 0 : searchScore.toNumber(),
        'availableForFullTime': record.get('availableForFullTime').toNumber(),
        'availableForFreelance': record.get('availableForFreelance').toNumber(),
        'availableForInternships': record.get('availableForInternships').toNumber(),
        'tagline': record.get('tagline'),
        'createdAt': record.get('createdAt'),
        'usersFollowing': arrayToNumbers(record.get('usersFollowing')),
        'professionIds': arrayToNumbers(record.get('professionIds')),
        'professions': record.get('professions'),
        'skillIds': arrayToNumbers(record.get('skillIds')),
        'skills': record.get('skills'),
      }

      return user
    }
  }
}
