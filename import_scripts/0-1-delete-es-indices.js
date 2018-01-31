const c = require('../config')
const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const esClient = require('../src/ElasticsearchClient')(new elasticsearch.Client(esConfig))

const createAutocompleteIndex = (index) => {
  const options = {
    "mappings": {
      [index]: {
        "properties": {
          "id": {
            "type": "long"
          },
          "name": {
            "type": "text",
            "analyzer": "autocomplete",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
        }
      }
    },
    "settings": {
      "number_of_shards": 1,
      "analysis": {
        "filter": {
          "autocomplete_filter": {
            "type": "edge_ngram",
            "min_gram": 1,
            "max_gram": 20
          }
        },
        "analyzer": {
          "autocomplete": {
            "type": "custom",
            "tokenizer": "keyword",
            "filter": [
              "lowercase",
              "autocomplete_filter"
            ]
          }
        }
      }
    }
  }

  return esClient.createIndex(index, options)
}

esClient.deleteAllIndices()
  .then(() => {
    console.log('All ES indices deleted')
  })
  .then(() => {
    const options = {
      "mappings": {
        "user": {
          "properties": {
            "availableForFreelance": {
              "type": "byte"
            },
            "availableForFullTime": {
              "type": "byte"
            },
            "availableForInternships": {
              "type": "byte"
            },
            "createdAt": {
              "type": "date",
              "format": "yyyy-MM-dd HH:mm:ss"
            },
            "firstName": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "id": {
              "type": "long"
            },
            "lastLoginAt": {
              "type": "date",
              "format": "yyyy-MM-dd HH:mm:ss"
            },
            "lastName": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "level": {
              "type": "byte"
            },
            "location": {
              "type": "geo_point"
            },
            "locationName": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "professionIds": {
              "type": "long"
            },
            "professions": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                },
                "english": {
                  "type": "text",
                  "analyzer": "english"
                }
              }
            },
            "profileImage": {
              "type": "text"
            },
            "searchScore": {
              "type": "long"
            },
            "skillIds": {
              "type": "long"
            },
            "skills": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                },
                "english": {
                  "type": "text",
                  "analyzer": "english"
                }
              }
            },
            "industries": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "tagline": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "usersFollowing": {
              "type": "long"
            }
          }
        }
      }
    }

    return esClient.createIndex(c.ES_INDEX_USER, options)
  })
  .then(() => createAutocompleteIndex(c.ES_INDEX_SKILL))
  .then(() => createAutocompleteIndex(c.ES_INDEX_PROFESSION))
  .catch((err) => {
    console.log(err)
    process.exit(1);
  })
