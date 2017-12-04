const c = require('./config')

const userIndex = c.ES_INDEX_USER
const professionIndex = c.ES_INDEX_PROFESSION

module.exports = ElasticsearchClient = (client) => {
  const search = (searchOptions) => {
    return new Promise((resolve, reject) => {
      client.search(searchOptions, (error, response) => {
        if (typeof error !== 'undefined') {
          console.log(error)
          reject(error)
        }
        resolve(response)
      })
    })
  }

  const create = (createOptions) => {
    return new Promise((resolve, reject) => {
      client.create(createOptions, (error, response) => {
        if (typeof error !== 'undefined') {
          console.log(error)
          reject(error)
        }
        console.log(response)
        resolve(response)
      })
    })
  }

  return {
    'createProfession': (profession) => {
      return create({
        index: professionIndex,
        type: 'profession',
        id: profession.id,
        body: profession
      })
    },

    'searchProfessions': (query, exclude) => {
      const exclusions = exclude.map(id => {
        return {
          term: {
            id: id
          }
        }
      })

      const searchOptions = {
        index: professionIndex,
        from: 0,
        size: 100,
        body: {
          query: {
            bool: {
              must: {
                match_phrase_prefix: {
                  name: `${query}`,
                }
              },
              must_not: exclusions
            }
          }
        }
      }

      return search(searchOptions)
    },

    'searchUsersByProfessions': (ids, relatedIdsWithCounts) => {
      const query1 = ids.map((id) => {
        return {
          match: {
            professionIds: {
              query: id
              // fuzziness: 'AUTO',
              // operator: 'and',
            }
          }
        }
      })

      const totalCount = relatedIdsWithCounts.reduce((a, v) => a + v.count, 0)

      const query2 = relatedIdsWithCounts.map(o => {
        const boost = (o.count / totalCount)
        console.log(boost)
        return {
          match: {
            professionIds: {
              query: o.id,
              boost: boost
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
              should: query1.concat(query2)
            }
          },
          aggs: {
            professions: {
              terms: {
                size: 10,
                exclude: ids,
                field: 'professionIds'
              }
            }
          }
        }
      }

      return search(searchOptions)
    }
  }
}
