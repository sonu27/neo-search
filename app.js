const c = require('./config')
const express = require('express')
const app = express()

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(`bolt://${c.NEO4J_HOST}`, neo4j.auth.basic(c.NEO4J_USER, c.NEO4J_PASS))
const Neo4jClient = require('./Neo4jClient')(driver)

app.get('/professions/:id/related', function (req, res) {
  Neo4jClient.getRelatedProfessions(req.params.id)
    .then((data) => {
      res.send({professions: data})
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
