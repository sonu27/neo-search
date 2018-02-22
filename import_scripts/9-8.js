const c = require('../config')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('../src/Neo4jClient')(driver)
const elasticsearch = require('elasticsearch')
const esClient = new elasticsearch.Client({host: `${c.ES_HOST}:${c.ES_PORT}`})

const algoliasearch = require('algoliasearch')
var client = algoliasearch('ZWTZSDMEVX', '6123dc701f639f6e1ddecf1dbf928c3a')
var index = client.initIndex('test_professions')

const session = driver.session()
let count = 0
let total = 0
let promise = Promise.resolve()
let professions = []

session
  .run('MATCH (p:Profession {visible: true}) RETURN p.id AS id')
  .subscribe({
    onNext: function (record) {
      let id = record.get('id').toNumber()
      total++

      promise = promise.then(
        () => new Promise((resolve, reject) => {
          Neo4jClient.getProfession(id).then(profession => {
            count++
            professions.push(profession)
            if (professions.length === 1000 || count === total) {
              let body = []
              professions.forEach(profession => {
                body.push(profession)
              })
              professions = []

              index.addObjects(body, function(err, content) {
                if (err) {
                  console.error(err)
                }
              })

              console.log(`ES ${count} professions sent`)
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
      console.log(`ES ${total} professions will be created`)

      session.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
