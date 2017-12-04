const c = require('./config')
const express = require('express')
const app = express()
const cors = require('cors')

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('./Neo4jClient')(driver)

const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const EsClient = require('./ElasticsearchClient')(new elasticsearch.Client(esConfig))

app.use(cors())

app.get('/professions/:id/related', function (req, res) {
  Neo4jClient.getRelatedProfessions(req.params.id)
    .then((data) => {
      res.send({professions: data})
    })
})

app.get('/professions', async function (req, res) {
  let exclude = []
  if (req.query.exclude !== undefined) {
    exclude = req.query.exclude.split(',').map(Number)
  }

  const data = await EsClient.searchProfessions(req.query.name, exclude)
  
  res.send({professions: data.hits.hits})
})

app.get('/users', async function (req, res) {
  const professions = req.query.professions.split(',').map(Number)
  const related = await Neo4jClient.getRelatedProfessionsWithCounts(professions)

  const data = await EsClient.searchUsersByProfessions(professions, related)

  const result = data.hits.hits.map(u => {
    u._source.score = u._score

    return u._source
  })

  res.json({
    users: result,
    aggs: data.aggregations.professions.buckets
  })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
