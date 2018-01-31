const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

session
  .run(`
    USING PERIODIC COMMIT
    LOAD CSV WITH HEADERS FROM "file:///user_industries.csv" AS row
    MATCH (u:User {id: toInteger(row.userId)}), (i:Industry {id: toInteger(row.industryId)})
    CREATE (u)-[r:HAS_INDUSTRY]->(i)
  `)
  .then(function () {
    session.close()
    driver.close()
    console.log('Neo4j User Industry relationships created')
  })
  .catch(function (error) {
    console.log(error)
    session.close()
    driver.close()
  })
