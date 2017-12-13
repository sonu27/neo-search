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
  .run('MATCH (s:Skill) RETURN s')
  .subscribe({
    onNext: function (record) {
      let skill = {
        id: record.get('s').properties.id.toNumber(),
        name: record.get('s').properties.name,
      }

      count++

      promise = promise.then(() => EsClient.createSkill(skill))
    },
    onCompleted: function () {
      console.log('all skills returned', count)
      session.close()
      driver.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
