const c = require('./config')
const express = require('express')
const app = express()

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('./Neo4jClient')(driver)

const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const EsClient = require('./ElasticsearchClient')(new elasticsearch.Client(esConfig))

app.get('/professions/:id/related', function (req, res) {
  Neo4jClient.getRelatedProfessions(req.params.id)
    .then((data) => {
      res.send({professions: data})
    })
})

app.get('/users', async function (req, res) {
  // Neo4jClient.getUsersByProfession(req.query.profession)
  // .then((data) => {
  //   res.send({users: data})
  // })

  // const data = await EsClient.search(req.query.profession)

  const professionIds = await Neo4jClient.searchProfessions(req.query.profession)


  const data = await EsClient.searchByProfessionIds(professionIds)

  res.send({users: data})
})



app.listen(3000, () => console.log('Example app listening on port 3000!'))
