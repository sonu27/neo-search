const c = require('./config')
const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const client = require('./ElasticsearchClient')(new elasticsearch.Client(esConfig))

test('some', async () => {
  const result = await client.search('design')
  console.log(await result)
  
})
