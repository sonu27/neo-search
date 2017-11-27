
module.exports = RecordTransformer = () => {
  function arrayToNumbers(arr) {
    return arr.map(element => {
      return element.toNumber()
    })
  }

  return {
    'toObject': (record) => {
      let level = record.get('level')
      let o = {
        'id': record.get('id').toNumber(),
        'firstName': record.get('firstName'),
        'lastName': record.get('lastName'),
        'level': level == null ? 0 : level.toNumber(),
        'createdAt': record.get('createdAt'),
        'usersFirstDegree': arrayToNumbers(record.get('usersFirstDegree')),
        //'usersSecondDegree': arrayToNumbers(record.get('usersSecondDegree')),
        'professionIds': arrayToNumbers(record.get('professionIds')),
        'professions': record.get('professions'),
      }

      return o
    }
  }
}
