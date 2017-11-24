const c = require('./config')

module.exports = Neo4jClient = (driver) => {
  return {
    'getRelatedProfessions': (id) => {
      const session = driver.session()

      return session
        .run(`
          MATCH (p:Profession {id: ${parseInt(id)}})<-[:HAS_A]-()-[:HAS_A]->(p2)
          WITH p2, count(p2) AS count ORDER BY count DESC LIMIT 10
          RETURN collect(p2.id) AS professionsIds
        `)
        .then((result) => {
          const ids = []
          result.records.forEach(record => {
            record.get('professionsIds').map(element => {
              return ids.push(element.toNumber())
            })
          })

          return ids
        })
        .catch(function(error) {
          console.error(error)
        })
    }
  }
}
