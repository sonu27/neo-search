const c = require('../config')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('../src/Neo4jClient')(driver)

const session = driver.session()
let count = 0
let total = 0
let promise = Promise.resolve()
let professions = []

session
  .run('MATCH (p:Profession) RETURN p.id AS id')
  .subscribe({
    onNext: function (record) {
      let id = record.get('id').toNumber()
      total++

      promise = promise.then(
        () => new Promise((resolve, reject) => {
          Neo4jClient.createRelatedProfessionsWithPc(id).then(resolve())
        })
      )

    },
    onCompleted: function () {
      console.log(`asdfadf ${total} professions will be created`)
      session.close()

    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
