const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

session
  .run(`
    USING PERIODIC COMMIT
    LOAD CSV WITH HEADERS FROM "file:///profession_counterparts.csv" AS row
    MATCH (p1:Profession {id: toInteger(row.professionId)}), (p2:Profession {id: toInteger(row.counterpartId)})
    CREATE (p1)-[r:HAS_COUNTERPART {equivalence: toFloat(row.equivalence)}]->(p2)
  `)
  .then(function () {
    session.close()
    driver.close()
    console.log('Fully Done')
  })
  .catch(function (error) {
    console.log(error)
    session.close()
    driver.close()
  })
