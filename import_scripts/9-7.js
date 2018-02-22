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

let writeStream = fs.createWriteStream(`${importDir}/pip.csv`, { encoding: 'utf8', flag: 'w' })

writeStream.write(`"professionId","professionName","visible","userCount","relatedSkills"\n`)

session
  .run(`match (p:Profession)<-[:HAS_PROFESSION]-(u:User)
  return p.id AS id, p.name AS name, p.visible AS visible, count(u) AS userCount
  order by count(u) desc`)
  .subscribe({
    onNext: function (record) {
      // console.log(record)
      let id = record.get('id').toNumber()
      let name = record.get('name')
      let visible = record.get('visible')
      let userCount = record.get('userCount')

      total++

      promise = promise.then(
        () => new Promise((resolve, reject) => {
          Neo4jClient.getRelatedSkillsForProfession(id).then(profession => {
            count++
            // body.push(profession)
            // output = `"${id}","${formatString(name)}","${visible}","${userCount}","${profession.skills.map(formatString)}"\n`
            output = `"${id}","${formatString(name)}","${visible}","${userCount}",${profession.skills.map(formatString).map(v => `"${v}"`)}\n`
            writeStream.write(output)
            // professions.push(profession)
            // if (professions.length === 1000 || count === total) {
              let body = []
              professions.forEach(profession => {
              })

              // body.forEach(p => {
              //   output = `${id}, ${name}, ${visible}, ${userCount}\n`
              //   writeStream.write(output)
              // })

              professions = []



              // console.log(`PIP ${count} professions sent`)
            // }

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
