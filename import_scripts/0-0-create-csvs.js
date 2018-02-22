const c = require('../config')
const SqlToCsv = require('../src/SqlToCsvCreator')
const importDir = c.APP_IMPORT_DIR
const client = SqlToCsv()

let path = `${importDir}/users.csv`
let sql = `
select
  u.id as id,
  trim(u.firstName) as firstName,
  trim(u.lastName) as lastName,
  u.levelId as level,
  u.searchScore as searchScore,
  u.availableForFullTime as availableForFullTime,
  u.availableForFreelance as availableForFreelance,
  u.availableForInternships as availableForInternships,
  u.createdAt as createdAt,
  u.lastLoginAt as lastLoginAt,
  trim(tb.text) as tagline,
  a.filename as profileImage,
  trim(l.name) as locationName,
  l.latitude as locationLatitude,
  l.longitude as locationLongitude
from users u
left join text_blocks tb
on u.taglineId = tb.id
left join assets a
on u.profileImageId = a.id
left join locations l
on u.locationId = l.id
where u.deletedAt is null
and u.id > 1000
`
let lastField = 'locationLongitude'

client.createCsv(path, sql, lastField)
  .then(() => {
    let path = `${importDir}/professions.csv`
    let sql = `
    select distinct
      p.id as id,
      trim(p.title) as name,
      p.parentId as parentId,
      CASE WHEN p.showInResults=1 THEN 'TRUE' ELSE 'FALSE' END as visible
    from professions p
    inner join user_professions up
    on p.id = up.professionId
    `
    let lastField = 'visible'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/skills.csv`
    let sql = `
    select distinct
      s.id as id,
      trim(s.title) as name,
      CASE WHEN s.showInResults=1 THEN 'TRUE' ELSE 'FALSE' END as visible
    from skills s
    inner join user_skills us
    on s.id = us.skillid
    WHERE s.deletedAt IS NULL
    `
    let lastField = 'visible'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/industries.csv`
    let sql = `
    select id, trim(title) AS "name"
    from industries
    `
    let lastField = 'name'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/user_followers.csv`
    let sql = `
    select followerUserId, followedUserId, createdAt
    from user_followers
    `
    let lastField = 'createdAt'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/user_professions.csv`
    let sql = `
    select
      up.userId as userId,
      up.professionId as professionId
    from user_professions up
    inner join users u
    on up.userId = u.id
    where u.deletedAt is null
    `
    let lastField = 'professionId'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/user_skills.csv`
    let sql = `
    select userId, skillId
    from user_skills
    `
    let lastField = 'skillId'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/user_industries.csv`
    let sql = `
    SELECT
      userId,
      industryId
    FROM user_industries ui
    INNER JOIN industries i
    ON ui.industryId = i.id
    `
    let lastField = 'industryId'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/user_experiences.csv`
    let sql = `
    SELECT DISTINCT
      e.authorId AS "userId",
      CASE WHEN e.organisationPageId IS NULL THEN trim(e.organisationName) ELSE trim(p.title) END as experience
    FROM experiences e
    INNER JOIN users u
    ON u.id = e.authorId
    LEFT JOIN pages p
    ON e.organisationPageId = p.id
    WHERE e.deletedAt IS NULL
    AND u.deletedAt IS NULL
    `
    let lastField = 'experience'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/projects.csv`
    let sql = `
    SELECT
      p.id,
      p.title AS name,
      p.authorId AS userId,
      p.updatedAt
    FROM projects p
    INNER JOIN users u
    ON p.authorId = u.id
    WHERE p.deletedAt IS NULL
    AND u.deletedAt IS NULL
    AND p.isSpam = 0
    `
    let lastField = 'updatedAt'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/project_skills.csv`
    let sql = `
    SELECT
      ps.projectId,
      ps.skillId
    FROM project_skills ps
    INNER JOIN projects p
    ON ps.projectId = p.id
    INNER JOIN users u
    ON p.authorId = u.id
    WHERE p.deletedAt IS NULL
    AND u.deletedAt IS NULL
    AND p.isSpam = 0
    `
    let lastField = 'skillId'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/project_industries.csv`
    let sql = `
    SELECT
      pi.projectId,
      pi.industryId
    FROM project_industries pi
    INNER JOIN projects p
    ON pi.projectId = p.id
    INNER JOIN users u
    ON p.authorId = u.id
    WHERE p.deletedAt IS NULL
    AND u.deletedAt IS NULL
    AND p.isSpam = 0
    `
    let lastField = 'industryId'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/profession_counterparts.csv`
    let sql = `
    SELECT
      professionId,
      counterpartId,
      equivalence
    FROM profession_counterparts
    `
    let lastField = 'equivalence'

    return client.createCsv(path, sql, lastField)
  })
  .then(() => {
    let path = `${importDir}/pip.csv`
    let sql = `
    select distinct
      p.id as id,
      trim(p.title) as name,
      p.parentId as parentId,
      CASE WHEN p.showInResults=1 THEN 'TRUE' ELSE 'FALSE' END as visible,
      count(up.userId) as userCount
    from professions p
    inner join user_professions up
    on p.id = up.professionId
    group by id
    order by userCount desc, name
    `
    let lastField = 'userCount'

    return client.createCsv(path, sql, lastField)
  })
