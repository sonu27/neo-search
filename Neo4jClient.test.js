const c = require('./config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('./Neo4jClient')(driver)

test('some', async () => {
  const result = await Neo4jClient.searchProfessions('design')
  console.log(await result)
  driver.close()
})
