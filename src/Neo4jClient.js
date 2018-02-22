const c = require('../config')
const RecordTransformer = require('./RecordTransformer')

module.exports = Neo4jClient = (driver) => {
  return {
    'getRelatedSkillsWithCounts': (skills) => {
      return new Promise((resolve, reject) => {
        const session = driver.session()

        session
          .run(`
            MATCH (s:Skill)<-[:HAS_SKILL]-()-[:HAS_SKILL]->(s2)
            WHERE s.name IN ['${skills.join("','")}']
            WITH s2.id AS skillId, s2.name AS skillName, count(s2) AS count
            WHERE count > 2
            RETURN skillId, skillName, count
            ORDER BY count DESC LIMIT 10
          `)
          .then((result) => {
            const ids = []
            result.records.forEach(record => {
              ids.push({
                id: record.get('skillId').toNumber(),
                name: record.get('skillName'),
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

    'getRelatedProfessionsWithCounts': (ids) => {
      return new Promise((resolve, reject) => {
        const session = driver.session()

        session
          .run(`
            MATCH (p:Profession)<-[:HAS_PROFESSION]-()-[:HAS_PROFESSION]->(p2)
            WHERE p.id IN [${ids.toString()}]
            RETURN p2.id AS professionId, p2.name AS professionName, count(p2) AS count
            ORDER BY count DESC LIMIT 10
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
          MATCH (p:Profession {id: ${parseInt(id)}})<-[:HAS_PROFESSION]-()-[:HAS_PROFESSION]->(p2)
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
          OPTIONAL MATCH (p)-[:HAS_PROFESSION]-()-[:HAS_PROFESSION]-(p2)
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
            OPTIONAL MATCH (p)-[:HAS_PROFESSION]-()-[:HAS_PROFESSION]-(p2)
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
          MATCH (u:User)-[:HAS_PROFESSION]->(p)
          WHERE toLower(p.name) CONTAINS toLower('${profession}')
          RETURN u LIMIT 50
        `)
        .then((result) => {
          const ids = []
          result.records.forEach(record => {
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
            RETURN
              u,
              [(u)-[:HAS_PROFESSION]->(p) | p.name] AS professions,
              [(u)-[:HAS_PROFESSION]->()-[:HAS_PARENT_PROFESSION]->(c) | c.name] AS professionCounterparts,
              [(u)-[:HAS_SKILL]->(s) | s.name] AS skills,
              [(u)-[:HAS_PROJECT]->()-[:PROJECT_HAS_SKILL]->(s) | s.name] AS projectSkills,
              [(u)-[:HAS_PROJECT]->()-[:PROJECT_HAS_INDUSTRY]->(s) | s.name] AS projectIndustries,
              [(u)-[:HAS_INDUSTRY]->(i) | i.name] AS industries,
              [(u)-[:HAS_EXPERIENCE]->(e) | e.name] AS experiences
          `)
          .subscribe({
            onNext: function (record) {
              let user = RecordTransformer().toObject(record.toObject())
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
    },

    'getProfession': (id) => {
      const session = driver.session()

      return new Promise((resolve, reject) => {
        session
          .run(`
            MATCH (p:Profession {id: ${id}})
            RETURN
              p,
              [(p)-[r:HAS_PARENT_PROFESSION]->(c) | c.name] AS counterparts
          `)
          .subscribe({
            onNext: function (record) {
              let profession = RecordTransformer().toProfession(record.toObject())
              resolve(profession)
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
    },

    'createRelatedSkillsForProfession': (id) => {
      const session = driver.session()

      return new Promise((resolve, reject) => {
        session
          .run(`
            MATCH (p:Profession {id: ${id}})<-[:HAS_PROFESSION]-()-[:HAS_SKILL]->(s)
            WITH p, s, count(s) AS count
            ORDER BY count DESC LIMIT 20
            WHERE count > 2
            create (p)-[:PROFESSION_HAS_SKILL]->(s)
          `)
          .subscribe({
            onNext: function (record) {
              let profession = RecordTransformer().toProfession(record.toObject())
              resolve(profession)
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
    },

    'getRelatedSkillsForProfession': (id) => {
      const session = driver.session()

      return new Promise((resolve, reject) => {
        session
          .run(`
            MATCH (p:Profession {id: ${id}})<-[:HAS_PROFESSION]-()-[:HAS_SKILL]->(s)
            WITH p, s, count(s) AS count
            ORDER BY count DESC LIMIT 20
            WHERE count > 2
            RETURN collect(s.name) AS skills
          `)
          .subscribe({
            onNext: function (record) {
              let profession = record.toObject()
              resolve(profession)
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
