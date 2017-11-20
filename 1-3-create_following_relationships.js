const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", ""))
let session = driver.session()

session
  .run(`
    USING PERIODIC COMMIT
    LOAD CSV WITH HEADERS FROM "file:///user_followers.csv" AS row
    MATCH (u1:User {id: toInteger(row.followerUserId)}), (u2:User {id: toInteger(row.followedUserId)})
    CREATE (u1)-[r:FOLLOWS {followedOn: row.createdAt}]->(u2)
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