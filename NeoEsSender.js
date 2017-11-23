const c = require('./config')
const elasticsearch = require('elasticsearch')
const esClient = new elasticsearch.Client({host: `${c.ES_HOST}:${c.ES_PORT}`})
const RecordTransformer = require('./RecordTransformer')

module.exports = NeoEsSender = (driver) => {
  return {
    'send': (id) => {
      const session = driver.session()

      return new Promise((resolve) => {
        session
          .run(`
            MATCH (u:User {id: ${id}})
            OPTIONAL MATCH (u)-[:FOLLOWS]->(u1)
            OPTIONAL MATCH (u1)-[:FOLLOWS]->(u2)
            OPTIONAL MATCH (u)-[:HAS_A]->(p)
            RETURN
              u.id AS id,
              u.firstName AS firstName,
              u.lastName AS lastName,
              u.level AS level,
              u.createdAt AS createdAt,
              collect(DISTINCT u1.id) AS usersFirstDegree,
              collect(DISTINCT u2.id) AS usersSecondDegree,
              collect(DISTINCT p.id) AS professionsFirstDegree
          `)
          .subscribe({
            onNext: function (record) {
              let user = RecordTransformer().toObject(record)

              esClient.create({
                index: 'search',
                type: 'user',
                id: user.id,
                body: user
              }, function (error, response) {
                console.log(error)
              })
        
              // esClient.update({
              //   index: 'search',
              //   type: 'user',
              //   id: user.id,
              //   body: {
              //     doc: user
              //   }
              // }, function (error, response) {
              //   console.log(error)
              // })
            },
            onCompleted: function () {
              session.close()
              resolve()
            },
            onError: function (error) {
              console.log(error)
              session.close()
            }
          })
      })
    }
  }
}
