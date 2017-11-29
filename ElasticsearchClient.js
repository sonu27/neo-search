const c = require('./config')

const userIndex = 'search'
const professionIndex = 'profession'

module.exports = ElasticsearchClient = (client) => {
  const search = (searchOptions) => {
    return new Promise((resolve, reject) => {
      client.search(searchOptions, (error, response) => {
        if (typeof error !== 'undefined') {
          reject(error)
        }
        resolve(response.hits.hits)
      })
    })
  }

  const create = (createOptions) => {
    return new Promise((resolve, reject) => {
      client.create(createOptions, (error, response) => {
        if (typeof error !== 'undefined') {
          reject(error)
        }
        resolve(response)
      })
    })
  }

  return {
    'createProfession': (profession) => {
      return create({
        index: 'profession',
        type: 'profession',
        id: profession.id,
        body: profession
      })
    },

    'searchProfessions': (query) => {
      const searchOptions = {
        index: professionIndex,
        from: 0,
        size: 100,
        body: {
          query: {
            fuzzy: {
              name: {
                value: `${query}`
              }
            }
          }
        }
      }
      console.log(searchOptions.body.query)

      return search(searchOptions)
    },

    'searchByProfessionIds': (ids) => {
      const queries = ids.map((id) => {
        return {
          match: {
            professionIds: {
              query: id,
              boost: 2
            }
          }
        }
      })

      const searchOptions = {
        index: userIndex,
        from: 0,
        size: 100,
        _sourceInclude: [
          'id',
          'firstName',
          'lastName',
          'level',
          'professions',
        ],
        body: {
          query: {
            bool: {
              must: queries
            }
          }
        }
      }
      console.log(searchOptions.body.query)

      return search(searchOptions)
    }
  }
}
