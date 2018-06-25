const c = require('../config')
const fs = require('fs')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('../src/Neo4jClient')(driver)

const importDir = c.APP_IMPORT_DIR

const session = driver.session()
let count = 0
let total = 0
let promise = Promise.resolve()
let professions = []

const formatString = (string) => {
  return string.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

let writeStream = fs.createWriteStream(`${importDir}/partitions.csv`, { encoding: 'utf8', flag: 'w' })

writeStream.write(`"professionId","professionName","partition"\n`)

session
  .run(`MATCH (n:Profession) return n.id, n.name, n.partition
  order by n.partition`)
  .subscribe({
    onNext: function (record) {
      let id = record.get('n.id').toNumber()
      let name = record.get('n.name')
      let partition = record.get('n.partition')

      total++

      promise = promise.then(
        () => new Promise((resolve, reject) => {
          Neo4jClient.getRelatedSkillsForProfession(id).then(profession => {
            count++
            output = `"${id}","${formatString(name)}","${partition}"\n`
            writeStream.write(output)

            if (count === total) {
              driver.close()
            }

            resolve()
          })
        })
      )




    },
    onCompleted: function () {
      console.log(`output csv ${total} professions will be created`)

      session.close()
    },
    onError: function (error) {
      console.log(error)
      session.close()
    }
  })
