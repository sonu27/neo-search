
module.exports = RecordTransformer = () => {
  function arrayToNumbers(arr) {
    return arr.map(element => {
      return element.toNumber()
    })
  }

  return {
    'toObject': (record) => {
      let level = record.get('level')
      let user = {
        'id': record.get('id').toNumber(),
        'firstName': record.get('firstName'),
        'lastName': record.get('lastName'),
        'level': level == null ? 0 : level.toNumber(),
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
