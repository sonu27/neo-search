
module.exports = RecordTransformer = () => {
    function arrayToNumbers(arr) {
        return arr.map(element => {
            return element.toNumber()
        })
    }
    
    return {
        'toObject': (record) => {
            let o = {
                'id': record.get('id').toNumber(),
                'firstName': record.get('firstName'),
                'lastName': record.get('lastName'),
                'usersFirstDegree': arrayToNumbers(record.get('usersFirstDegree')),
                'usersSecondDegree': arrayToNumbers(record.get('usersSecondDegree')),
                'professionsFirstDegree': arrayToNumbers(record.get('professionsFirstDegree')),
                'professionsSecondDegree': arrayToNumbers(record.get('professionsSecondDegree')),
            }

            return o
        }
    }
}