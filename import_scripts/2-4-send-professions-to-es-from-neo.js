const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))

const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const EsClient = require('../src/ElasticsearchClient')(new elasticsearch.Client(esConfig))

const session = driver.session()
let count = 0
let promise = Promise.resolve()

session
  .run('MATCH (p:Profession) RETURN p')
  .subscribe({
    onNext: function (record) {
      let profession = {
        id: record.get('p').properties.id.toNumber(),
        name: record.get('p').properties.name,
      }

      count++

      promise = promise.then(() => EsClient.createProfession(profession))
    },
    onCompleted: function () {
      console.log(`ES ${count} professions created`)
      session.close()
      driver.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
