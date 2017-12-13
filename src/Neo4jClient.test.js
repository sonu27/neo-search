const c = require('../config')
const neo4j = require('neo4j-driver').v1

let driver
let Neo4jClient

beforeEach(() => {
  driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
  Neo4jClient = require('./Neo4jClient')(driver)
});

afterEach(() => {
  driver.close()
});

test('search professions', async () => {
  await expect(Neo4jClient.searchProfessions('design')).resolves.toBeDefined()
})

test('related professions', async () => {
  //graphic designer: 70944
  await expect(Neo4jClient.getRelatedProfessions(70944)).resolves.toBeDefined()
})

test('getRelatedProfessionsWithCounts', async () => {
  //graphic designer: 70944
  await expect(Neo4jClient.getRelatedProfessionsWithCounts([70944, 70931])).resolves.toBeDefined()
})
