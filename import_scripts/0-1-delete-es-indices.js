const c = require('../config')
const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const esClient = require('../src/ElasticsearchClient')(new elasticsearch.Client(esConfig))

esClient.deleteAllIndices()
  .then(() => {
    console.log('All ES indices deleted')
  })
  .catch((err) => {
    console.log(err)
    process.exit(1);
  })
