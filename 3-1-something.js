const c = require('./config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()
const RecordTransformer = require('./RecordTransformer')
const elasticsearch = require('elasticsearch')
const esClient = new elasticsearch.Client({host: `${c.ES_HOST}:${c.ES_PORT}`})

session
  .run(`
    MATCH (u:User {id: 99997})
    OPTIONAL MATCH (u)-[:FOLLOWS]-(u1)-[:FOLLOWS]->(u2)
    OPTIONAL MATCH (u)-[:HAS_A]-(p)-[:HAS_COUNTERPART]-(p2)
    RETURN 
      u.id AS id,
      u.firstName AS firstName,
      u.lastName AS lastName,
      collect(DISTINCT u1.id) AS usersFirstDegree,
      collect(DISTINCT u2.id) AS usersSecondDegree,
      collect(DISTINCT p.id) AS professionsFirstDegree,
      collect(DISTINCT p2.id) AS professionsSecondDegree
  `)
  .subscribe({
    onNext: function (record) {
      let t = RecordTransformer().toObject(record)

      esClient.create({
        index: 'search',
        type: 'user',
        id: t.id,
        body: t
      }, function (error, response) {
        
      })
    },
    onCompleted: function () {
      session.close()
      driver.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
      driver.close()
    }
  })
