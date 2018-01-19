const c = require('../config')
const _ = require('lodash')

const userIndex = c.ES_INDEX_USER
const professionIndex = c.ES_INDEX_PROFESSION
const skillIndex = c.ES_INDEX_SKILL

const isNotEmptyArray = (variable) => _.isArray(variable) && !_.isEmpty(variable)

module.exports = ElasticsearchClient = (client) => {
  const userFields = [
    'id',
    'firstName',
    'lastName',
    'level',
    'location',
    'locationName',
    'profileImage',
    'searchScore',
    'availableForFullTime',
    'availableForFreelance',
    'availableForInternships',
    'tagline',
    'professions',
    'skills',
  ]

  const sort = [
    '_score',
    { searchScore : 'desc' },
    { level : 'desc' },
    'firstName.keyword',
    'lastName.keyword',
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
        resolve(response)
      })
    })
  }

  return {
    'deleteAllIndices': () => {
      return client.indices.delete({ index: '*' })
    },

    'createIndex': (index, options) => {
      return client.indices.create({ index: index, body: options })
    },

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
      const exclusions = exclude.map(name => {
        return {
          term: {
            'name.keyword': name
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

    'searchProfessionsById': (query, exclude) => {
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

    'searchLocations': (query, exclude) => {
      const exclusions = exclude.map(location => {
        return {
          term: {
            "locationName.keyword": location
          }
        }
      })

      const searchOptions = {
        index: userIndex,
        from: 0,
        size: 0,
        body: {
          query: {
            bool: {
              must: {
                match_phrase_prefix: {
                  locationName: `${query}`,
                }
              },
              must_not: exclusions
            }
          },
          aggs: {
            locations: {
              terms: {
                size: 25,
                field: 'locationName.keyword'
              }
            },
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
          },
          sort: sort,
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
          },
          sort: sort,
        }
      }

      return search(searchOptions)
    },

    'searchUsers3': (skills, professions, levels, availabilities, locations, pagination) => {

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
        from: pagination.from,
        size: pagination.size,
        _sourceInclude: userFields,
        body: {
          query: {
            bool: {
              must: query1.concat(query2),
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
          },
          sort: sort,
        }
      }

      const filters = []

      if (isNotEmptyArray(levels)) {
        filters.push({
          terms: { level: levels }
        })
      }

      if (isNotEmptyArray(availabilities)) {
        const a = availabilities.map(v => {
          filters.push({
            terms: { [v]: [1] }
          })
        })
      }

      if (isNotEmptyArray(locations)) {
        filters.push({
          terms: { 'locationName.keyword': locations }
        })
      }

      if (isNotEmptyArray(filters)) {
        searchOptions.body.query.bool.filter = filters
      }

      console.log(JSON.stringify(searchOptions))

      return search(searchOptions)
    },

    'searchUsersForJob': (skills, professions, levels, availabilities, locations, pagination, idsOnly = false) => {

      const query1 = skills.map((skill) => {
        return {
          match: {
            'skills.english': {
              query: skill
            }
          }
        }
      })

      const query2 = professions.map((profession) => {
        return {
          match: {
            'professions.english': {
              query: profession
            }
          }
        }
      })

      const searchOptions = {
        index: userIndex,
        from: pagination.from,
        size: pagination.size,
        _sourceInclude: idsOnly ? false : userFields,
        body: {
          query: {
            function_score: {
              query: {
                bool: {
                  should: query1.concat(query2),
                }
              },
              field_value_factor: {
                field: 'searchScore',
                modifier: 'log1p',
                factor: 0.25
              },
              boost_mode: 'sum'
            }
          },
          sort: [
            '_score',
            { searchScore : 'desc' },
            { level : 'desc' },
            'firstName.keyword',
            'lastName.keyword',
          ],
        }
      }

      const filters = []

      if (isNotEmptyArray(levels)) {
        filters.push({
          terms: { level: levels }
        })
      }

      if (isNotEmptyArray(locations)) {
        filters.push({
          terms: { 'locationName.keyword': locations }
        })
      }

      if (isNotEmptyArray(filters)) {
        searchOptions.body.query.function_score.query.bool.filter = filters
      }

      console.log(JSON.stringify(searchOptions))

      return search(searchOptions)
    },

  }
}
