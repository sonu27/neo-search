const c = require('./config')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const neoEs = require('./NeoEsSender')(driver)

const session = driver.session()
let count = 0
let promise = Promise.resolve()

session
  .run('MATCH (u:User) return u.id AS id')
  .subscribe({
    onNext: function (record) {
      let id = record.get('id').toNumber()
      count++

      promise = promise.then(() => neoEs.send(id))
    },
    onCompleted: function () {
      console.log('all users returned', count)
      session.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
