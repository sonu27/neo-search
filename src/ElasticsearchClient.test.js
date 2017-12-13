const c = require('../config')
const elasticsearch = require('elasticsearch')
const esConfig = {host: `${c.ES_HOST}:${c.ES_PORT}`}
const client = require('./ElasticsearchClient')(new elasticsearch.Client(esConfig))

test('searchProfessions', async () => {
  await expect(client.searchProfessions('design', [])).resolves.toBeDefined()
})

test('searchUsersByProfessions', async () => {
  //graphic designer: 70944
  await expect(client.searchUsersByProfessions([70944], [])).resolves.toBeDefined()
})
