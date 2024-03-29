const c = require('./config')
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('./src/Neo4jClient')(driver)

const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const EsClient = require('./src/ElasticsearchClient')(new elasticsearch.Client(esConfig))

const app = express()
app.use(cors())

const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const esPaginationCreator = (req) => {
  const size = _.get(req, 'query.size', 10)
  const page = _.get(req, 'query.page', 1)
  const from = (page * size) - size

  return {
    from: from,
    size: size,
  }
}

app.get('/professions', async function (req, res) {
  let exclude = []
  if (req.query.exclude !== undefined) {
    exclude = req.query.exclude.split(',')
  }

  const data = await EsClient.searchProfessions(req.query.name, exclude)

  res.send({ professions: data.hits.hits })
})

app.post('/professions', jsonParser, async function (req, res) {
  const data = await EsClient.searchProfessions(_.get(req, 'body.name', ''), _.get(req, 'body.exclude', []))
  const professions = _.get(data, 'hits.hits', []).map(i => ({ id: i._source.id, name: i._source.name }))

  res.send({ professions: professions })
})

app.get('/professions2', async function (req, res) {
  let exclude = []
  if (req.query.exclude !== undefined) {
    exclude = req.query.exclude.split(',').map(Number)
  }

  const data = await EsClient.searchProfessionsById(req.query.name, exclude)

  res.send({ professions: data.hits.hits })
})

app.get('/professions/:id/related', function (req, res) {
  Neo4jClient.getRelatedProfessions(req.params.id)
    .then((data) => {
      res.send({ professions: data })
    })
})

app.get('/skills', async function (req, res) {
  let exclude = []
  if (req.query.exclude !== undefined) {
    exclude = req.query.exclude.split(',')
  }

  const data = await EsClient.searchSkills(req.query.name, exclude)

  res.send({ skills: data.hits.hits })
})

app.post('/skills', jsonParser, async function (req, res) {
  const data = await EsClient.searchSkills(_.get(req, 'body.name', ''), _.get(req, 'body.exclude', []))
  const skills = _.get(data, 'hits.hits', []).map(i => ({ id: i._source.id, name: i._source.name }))

  res.send({ skills: skills })
})

app.post('/skills/related', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400)

  const relatedSkills = await Neo4jClient.getRelatedSkillsWithCounts(req.body.skills)

  res.send({ relatedSkills: relatedSkills })
})

app.post('/locations', jsonParser, async function (req, res) {
  const data = await EsClient.searchLocations(_.get(req, 'body.name', ''), _.get(req, 'body.exclude', []))

  const locations = data.aggregations.locations.buckets.map(i => ({ name: i.key }))

  res.send({ locations: locations })
})

app.get('/users', async function (req, res) {
  const professions = req.query.professions.split(',').map(Number)
  const related = await Neo4jClient.getRelatedProfessionsWithCounts(professions)

  const data = await EsClient.searchUsersByProfessions(professions, related)

  const results = data.hits.hits.map(u => {
    u._source.score = u._score

    return u._source
  })

  const aggregations = _.zip(
    data.aggregations.professionIds.buckets.map(x => x.key),
    data.aggregations.professionNames.buckets.map(x => x.key),
  )

  res.json({
    users: results,
    aggs: aggregations
  })
})

app.get('/users2', async function (req, res) {
  const query = req.query.query

  let professions = []
  let related = []

  if (req.query.professions !== '') {
    professions = req.query.professions.split(',').map(Number)

    related = await Neo4jClient.getRelatedProfessionsWithCounts(professions)
  }

  const data = await EsClient.searchUsers2(query, professions)

  const results = data.hits.hits.map(u => {
    u._source.score = u._score

    return u._source
  })

  const aggregations = _.zip(
    data.aggregations.professionIds.buckets.map(x => x.key),
    data.aggregations.professionNames.buckets.map(x => x.key),
  )

  res.json({
    users: results,
    aggs: aggregations,
    related: related,
  })
})

app.post('/users3', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400)

  const data = await EsClient.searchUsers3(
    req.body.skills,
    req.body.professions,
    req.body.levels,
    req.body.availabilities,
    req.body.locations,
    esPaginationCreator(req)
  )

  const results = data.hits.hits.map(u => {
    u._source.score = u._score

    return u._source
  })

  res.json({
    total: data.hits.total,
    users: results,
    aggregations: {
      skills: data.aggregations.skills.buckets.map(i => i.key),
      professions: data.aggregations.professions.buckets.map(i => i.key),
      locations: data.aggregations.locations.buckets.map(i => i.key),
      levels: data.aggregations.levels.buckets.map(i => i.key),
    },
  })
})

app.post('/users4', jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400)

  const idsOnly = _.get(req, 'query.idsOnly', false)

  const data = await EsClient.searchUsersForJob(
    req.body.skills,
    req.body.professions,
    req.body.levels,
    req.body.availabilities,
    req.body.locations,
    esPaginationCreator(req),
    idsOnly
  )

  const results = data.hits.hits.map(u => {
    if (idsOnly) {
      return u._id
    } else {
      u._source.score = u._score

      return u._source
    }
  })

  res.json({
    total: data.hits.total,
    users: results,
  })
})

app.listen(3000, () => console.log('Search.next listening on port 3000'))
