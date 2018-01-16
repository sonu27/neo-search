const config = require('config')

module.exports = {
  'APP_IMPORT_DIR': config.get('app.importDir'),
  'NEO4J_HOST': config.get('neo4j.host'),
  'NEO4J_USER': config.get('neo4j.user'),
  'NEO4J_PASS': config.get('neo4j.pass'),
  'ES_HOST': config.get('es.host'),
  'ES_PORT': config.get('es.port'),
  'ES_INDEX_USER': config.get('es.index.user'),
  'ES_INDEX_PROFESSION': config.get('es.index.profession'),
  'ES_INDEX_SKILL': config.get('es.index.skill'),
  'MYSQL_HOST': config.get('db.host'),
  'MYSQL_PORT': config.get('db.port'),
  'MYSQL_USER': config.get('db.user'),
  'MYSQL_PWD': config.get('db.pass'),
  'MYSQL_DB': config.get('db.database'),
}
