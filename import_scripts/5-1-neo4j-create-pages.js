const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

console.log('Neo4j creating pages')

session
  .run(`CREATE CONSTRAINT ON (s:Page) ASSERT s.name IS UNIQUE`)
  .then(() => {
    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///user_experiences.csv" AS row
      MERGE (
        :Page {
          name: row.experience
        }
      )
    `)
  })
  .then(() => {
    console.log('Neo4j creating user experiences')

    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///user_experiences.csv" AS row
      MATCH (u:User {id: toInteger(row.userId)}), (p:Page {name: row.experience})
      CREATE (u)-[r:HAS_EXPERIENCE]->(p)
    `)
  })
  .then(function () {
    session.close()
    driver.close()
    console.log('Neo4j pages created')
  })
  .catch(function (error) {
    console.log(error)
    session.close()
    driver.close()
  })
