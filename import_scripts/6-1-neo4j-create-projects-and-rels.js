const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

console.log('Neo4j creating projects')

session
  .run(`CREATE CONSTRAINT ON (p:Project) ASSERT p.id IS UNIQUE`)
  .then(() => {
    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///projects.csv" AS row
      CREATE (
        :Project {
          id: toInteger(row.id),
          name: row.name,
          updatedAt: row.updatedAt
        }
      )
    `)
  })
  .then(() => {
    console.log('Neo4j creating user projects relationships')

    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///projects.csv" AS row
      MATCH (u:User {id: toInteger(row.userId)}), (p:Project {id: toInteger(row.id)})
      CREATE (u)-[:HAS_PROJECT]->(p)
    `)
  })
  .then(() => {
    console.log('Neo4j creating project skills relationships')

    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///project_skills.csv" AS row
      MATCH (p:Project {id: toInteger(row.projectId)}), (s:Skill {id: toInteger(row.skillId)})
      CREATE (p)-[:PROJECT_HAS_SKILL]->(s)
    `)
  })
  .then(() => {
    console.log('Neo4j creating project industry relationships')

    return session.run(`
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM "file:///project_industries.csv" AS row
      MATCH (p:Project {id: toInteger(row.projectId)}), (i:Industry {id: toInteger(row.industryId)})
      CREATE (p)-[:PROJECT_HAS_INDUSTRY]->(i)
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
