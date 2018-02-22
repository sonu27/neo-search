const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

console.log('Neo4j creating professions')

session
  .run(`CREATE CONSTRAINT ON (p:Profession) ASSERT p.id IS UNIQUE`)
  .then(() => {
    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///professions.csv" AS row
      CREATE (
        :Profession {
          id: toInteger(row.id),
          name: row.name,
          visible: toBoolean(row.visible)
        }
      )
    `)
  })
  .then(() => {
    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///professions.csv" AS row
      MATCH (c:Profession {id: toInteger(row.parentId)}), (p:Profession {id: toInteger(row.id)})
      CREATE (p)-[r:HAS_PARENT_PROFESSION]->(c)
    `)
  })
  .then(function () {
    session.close()
    driver.close()
    console.log('Neo4j Professions created')
  })
  .catch(function (error) {
    console.log(error)
    session.close()
    driver.close()
  })
