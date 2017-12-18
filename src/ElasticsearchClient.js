const c = require('../config')
const _ = require('lodash')

const userIndex = c.ES_INDEX_USER
const professionIndex = c.ES_INDEX_PROFESSION
const skillIndex = c.ES_INDEX_SKILL

module.exports = ElasticsearchClient = (client) => {
  const userFields = [
    'id',
    'firstName',
    'lastName',
    'level',
    'locationLatitude',
    'locationLongitude',
    'locationName',
    'profileImage',
    'searchScore',
    'tagline',
    'professions',
    'skills',
  ]

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

    'createSkill': (skill) => {
      return create({
        index: skillIndex,
        type: 'skill',
        id: skill.id,
        body: skill
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

    'searchSkills': (query, exclude) => {
      const exclusions = exclude.map(skill => {
        return {
          term: {
            "name.keyword": skill
          }
        }
      })

      const searchOptions = {
        index: skillIndex,
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
        _sourceInclude: userFields,
        body: {
          query: {
            bool: {
              should: query1.concat(query2)
            }
          },
          aggs: {
            professionIds: {
              terms: {
                size: 10,
                field: 'professionIds'
              }
            },
            professionNames: {
              terms: {
                size: 10,
                field: 'professions.keyword'
              }
            },
          }
        }
      }

      return search(searchOptions)
    },

    'searchUsers2': (query, professionIds) => {
      const query1 = [
        {
          match: {
            professions: {
              query: query
            }
          }
        },
        {
          match: {
            skills: {
              query: query
            }
          }
        },
      ]
      
      const query2 = professionIds.map((id) => {
        return {
          match: {
            professionIds: {
              query: id
            }
          }
        }
      })

      const searchOptions = {
        index: userIndex,
        from: 0,
        size: 100,
        _sourceInclude: userFields,
        body: {
          query: {
            bool: {
              should: query1,
              must: query2
            }
          },
          aggs: {
            professionIds: {
              terms: {
                size: 10,
                field: 'professionIds'
              }
            },
            professionNames: {
              terms: {
                size: 10,
                field: 'professions.keyword'
              }
            },
            locations: {
              terms: {
                size: 10,
                field: 'locationName.keyword'
              }
            },
          }
        }
      }

      return search(searchOptions)
    },

    'searchUsers3': (skills, professions, levels) => {
      
      const query1 = skills.map((skill) => {
        return {
          match: {
            skills: {
              query: skill
            }
          }
        }
      })

      const query2 = professions.map((profession) => {
        return {
          match: {
            professions: {
              query: profession
            }
          }
        }
      })

      const searchOptions = {
        index: userIndex,
        from: 0,
        size: 100,
        _sourceInclude: userFields,
        body: {
          query: {
            bool: {
              should: query1.concat(query2),
            }
          },
          aggs: {
            skills: {
              terms: {
                field: 'skills.keyword',
                size: 10,
                exclude: skills,
              }
            },
            professions: {
              terms: {
                field: 'professions.keyword',
                size: 10,
                exclude: professions,
              }
            },
            locations: {
              terms: {
                field: 'locationName.keyword',
                size: 10,
              }
            },
            levels: {
              terms: {
                field: 'level',
                size: 5,
              }
            },
          }
        }
      }

      if (_.isArray(levels) && !_.isEmpty(levels)) {
        searchOptions.body.query.bool.filter = {
          terms: {
            level: levels, 
          }
        }
      }
      
      console.log(JSON.stringify(searchOptions))

      return search(searchOptions)
    },
    
  }
}
