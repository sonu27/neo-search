const c = require('../config')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('../src/Neo4jClient')(driver)
const elasticsearch = require('elasticsearch')
const esClient = new elasticsearch.Client({host: `${c.ES_HOST}:${c.ES_PORT}`})

const algoliasearch = require('algoliasearch');
var client = algoliasearch('ZWTZSDMEVX', '6123dc701f639f6e1ddecf1dbf928c3a');
var index = client.initIndex('test_amarjeet2');

const session = driver.session()
let count = 0
let total = 0
let promise = Promise.resolve()
let users = []

session
  .run('MATCH (u:User) RETURN u.id AS id')
  .subscribe({
    onNext: function (record) {
      let id = record.get('id').toNumber()
      total++

      promise = promise.then(
        () => new Promise((resolve, reject) => {
          Neo4jClient.getUser(id).then(user => {
            count++
            users.push(user)
            if (users.length === 1000 || count === total) {
              let body = []
              users.forEach(user => {
                // body.push({ index:  { _index: c.ES_INDEX_USER, _type: 'user', _id: user.id } })
                body.push(user)
              })
              users = []

              index.addObjects(body, function(err, content) {
                if (err) {
                  console.error(err);
                }
              });
              // esClient.bulk({ body: body })
              //   .catch((error) => console.log(error))

              console.log(`ES ${count} users sent`)
            }

            if (count === total) {
              driver.close()
            }

            resolve()
          })
        })
      )
    },
    onCompleted: function () {
      console.log(`ES ${total} users will be created`)

      session.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
