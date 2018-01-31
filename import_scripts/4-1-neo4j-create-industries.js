const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

console.log('Neo4j creating industries')

session
  .run(`CREATE CONSTRAINT ON (s:Industry) ASSERT s.id IS UNIQUE`)
  .then(() => {
    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///industries.csv" AS row
      CREATE (
        :Industry {
          id: toInteger(row.id),
          name: row.name
        }
      )
    `)
  })
  .then(function () {
    session.close()
    driver.close()
    console.log('Neo4j industries created')
  })
  .catch(function (error) {
    console.log(error)
    session.close()
    driver.close()
  })
