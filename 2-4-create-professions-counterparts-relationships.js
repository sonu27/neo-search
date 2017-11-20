const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", ""))
let session = driver.session()

session
  .run(`
    USING PERIODIC COMMIT
    LOAD CSV WITH HEADERS FROM "file:///profession_counterparts.csv" AS row
    MATCH (p1:Profession {id: row.professionId}), (p2:Profession {id: row.counterpartId})
    CREATE (p1)-[r:HAS_COUNTERPART {equivalence: row.equivalence}]->(p2)
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