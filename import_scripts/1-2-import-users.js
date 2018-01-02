const c = require('../config')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const session = driver.session()

session
  .run(`
    USING PERIODIC COMMIT
    LOAD CSV WITH HEADERS FROM "file:///users.csv" AS row
    CREATE (
      :User {
        id: toInteger(row.id),
        firstName: trim(row.firstName),
        lastName: trim(row.lastName),
        level: toInteger(row.level),
        searchScore: toInteger(row.searchScore),
        availableForFullTime: toInteger(row.availableForFullTime),
        availableForFreelance: toInteger(row.availableForFreelance),
        availableForInternships: toInteger(row.availableForInternships),
        tagline: trim(row.tagline),
        profileImage: trim(row.profileImage),
        locationName: trim(row.locationName),
        locationLatitude: toFloat(row.locationLatitude),
        locationLongitude: toFloat(row.locationLongitude),
        createdAt: row.createdAt
      }
    )
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
