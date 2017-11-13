const csv = require('fast-csv')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1

// const driver = neo4j.driver("bolt://52.91.126.14:33363", neo4j.auth.basic("neo4j", "answer-accruals-fractures"));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", ""))
const stream = fs.createReadStream('rel_result.csv')

const promises = []

csv
  .fromStream(stream, {headers: true})
  .on('data', (data) => {
    let session = driver.session()
    promises.push(
      session
        .run(
          'MATCH (u1:User {id: {follower}}), (u2:User {id: {followed}}) MERGE (u1)-[r:FOLLOWING]->(u2)',
          { follower: data.followerUserId, followed: data.followedUserId }
        )
        .then(function (result) {
          result.records.forEach(function (record) {
            console.log(record.get('u.id'))
          })
          session.close();
        })
        .catch(function (error) {
          console.log(error)
        })
    )
  })
  .on('end', () => {
    console.log('CSV Done')
    Promise.all(promises).then(() => {
      driver.close()
      console.log('Fully Done')
    })
  })
