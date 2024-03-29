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
  .run('MATCH (s:Skill {visible: true}) RETURN s')
  .subscribe({
    onNext: function (record) {
      let skill = {
        id: record.get('s').properties.id.toNumber(),
        name: record.get('s').properties.name,
        visible: record.get('s').properties.visible,
      }

      count++

      promise = promise.then(() => EsClient.createSkill(skill))
    },
    onCompleted: function () {
      console.log(`ES ${count} skills will be created`)
      promise.then(() => console.log(`ES ${count} skills were created`))
      session.close()
      driver.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
