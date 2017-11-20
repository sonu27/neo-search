const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", ""))
let session = driver.session()

session
  .run(`
    CREATE CONSTRAINT ON (p:Profession) ASSERT p.id IS UNIQUE
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