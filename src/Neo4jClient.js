const c = require('../config')
const RecordTransformer = require('./RecordTransformer')

module.exports = Neo4jClient = (driver) => {
  return {
    'getRelatedProfessionsWithCounts': (ids) => {
      return new Promise((resolve, reject) => {
        const session = driver.session()

        session
          .run(`
            MATCH (p:Profession)<-[:HAS_A]-()-[:HAS_A]->(p2)
            WHERE p.id IN [${ids.toString()}]
            RETURN p2.id AS professionId, p2.name AS professionName, count(p2) AS count ORDER BY count DESC LIMIT ${ids.length * 10}
          `)
          .then((result) => {
            const ids = []
            result.records.forEach(record => {
              ids.push({
                id: record.get('professionId').toNumber(),
                name: record.get('professionName'),
                count: record.get('count').toNumber(),
              })
            })

            session.close()
            resolve(ids)
          })
          .catch((error) => {
            session.close()
            reject(error)
          })
      })
    },

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

          return primaryProfessions

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

    'searchProfessions2': (query) => {
      return new Promise((resolve, reject) => {
        const session = driver.session()
      
        const primaryProfessions = new Set()
        const relatedProfessions = new Set()

        session
          .run(`
            MATCH (p:Profession)
            OPTIONAL MATCH (p)-[:HAS_A]-()-[:HAS_A]-(p2)
            WHERE toLower(p.name) CONTAINS toLower('${query}')
            RETURN p.id AS pid, p2, count(p2) AS count ORDER BY count DESC LIMIT 10
          `)
          .subscribe({
            onNext: (record) => {
              primaryProfessions.add(record.get('pid').toNumber())
              relatedProfessions.add({
                id: record.get('p2').properties.id.toNumber(),
                count: record.get('count'),
              })
            },
            onCompleted: () => {
              session.close();
              resolve({
                primaryProfessions: Array.from(primaryProfessions),
                relatedProfessions
              })
            },
            onError: (error) => {
              reject(error)
            }
          })
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
    },

    'getUser': (id) => {
      const session = driver.session()

      return new Promise((resolve, reject) => {
        session
          .run(`
            MATCH (u:User {id: ${id}})
            OPTIONAL MATCH (u)-[:FOLLOWS]->(u1)
            OPTIONAL MATCH (u)-[:HAS_A]->(p)
            OPTIONAL MATCH (u)-[:HAS_SKILL]->(s)
            RETURN
              u.id AS id,
              u.firstName AS firstName,
              u.lastName AS lastName,
              u.level AS level,
              u.createdAt AS createdAt,
              collect(DISTINCT u1.id) AS usersFollowing,
              collect(DISTINCT p.id) AS professionIds,
              collect(DISTINCT p.name) AS professions,
              collect(DISTINCT s.id) AS skillIds,
              collect(DISTINCT s.name) AS skills
          `)
          .subscribe({
            onNext: function (record) {
              let user = RecordTransformer().toObject(record)
              resolve(user)
            },
            onCompleted: function () {
              session.close()
            },
            onError: function (error) {
              console.log(error)
              session.close()
              reject(error)
            }
          })
      })
    }
  }
}
