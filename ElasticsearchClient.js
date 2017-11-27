const c = require('./config')

const userIndex = 'search'

module.exports = ElasticsearchClient = (client) => {
  return {
    'search': (q) => {
      return new Promise((resolve, reject) => {
        const search = {
          index: userIndex,
          body: {
            query: {
              match: {
                professions: q
              }
            }
          }
        }

        client.search(search, (error, response) => {
          if (typeof error !== 'undefined') {
            reject(error)
          }
          resolve(response.hits.hits)
        })
      })
    },
    'searchByProfessionIds': (ids) => {
      const queries = ids.map((id) => {
        return {
          match: {
            professionIds: id
          }
        }
      })

      return new Promise((resolve, reject) => {
        let search = {
          index: userIndex,
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
                should: queries
              }
            }
          }
        }

        client.search(search, (error, response) => {
          if (typeof error !== 'undefined') {
            reject(error)
          }
          resolve(response.hits.hits)
        })
      })
    }
  }
}
