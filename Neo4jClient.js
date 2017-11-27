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

          session.close()

          return ids
        })
        .catch(function(error) {
          console.error(error)
          session.close()
        })
    },
    'searchProfessions': (query) => {
      const session = driver.session()

      return session
        .run(`
          MATCH (p:Profession)
          OPTIONAL MATCH (p)-[:HAS_A]-()-[:HAS_A]-(p2)
          WHERE toLower(p.name) CONTAINS toLower('${query}')
          WITH p, p2, count(p2) AS count ORDER BY count DESC LIMIT 10
          RETURN collect(distinct p.id) AS primaryProfessions, collect(distinct p2.id) AS relatedProfessions
        `)
        .then((result) => {
          const primaryProfessions = []
          result.records.forEach(record => {
            record.get('primaryProfessions').map(element => {
              return primaryProfessions.push(element.toNumber())
            })
          })

          const relatedProfessions = []
          result.records.forEach(record => {
            record.get('relatedProfessions').map(element => {
              return relatedProfessions.push(element.toNumber())
            })
          })

          session.close()

          return Array.from(new Set(primaryProfessions.concat(relatedProfessions)))
        })
        .catch(function(error) {
          console.error(error)
          session.close()
        })
    },
    'getUsersByProfession': (profession) => {
      const session = driver.session()

      return session
        .run(`
        MATCH (u:User)-[:HAS_A]->(p)
        WHERE toLower(p.name) CONTAINS toLower('${profession}')
        RETURN u LIMIT 50
        `)
        .then((result) => {
          const ids = []
          result.records.forEach(record => {
            console.log(record)
            record.get('u').map(element => {
              return ids.push(element.id.toNumber())
            })
          })

          session.close()

          return ids
        })
        .catch(function(error) {
          console.error(error)
          session.close()
        })
    }
  }
}
