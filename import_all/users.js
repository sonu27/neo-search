const c = require('../config')
const fs = require('fs')
const mysql = require('mysql')
const stringify = require('csv-stringify')

const lastField = 'locationLongitude'

const connection = mysql.createConnection({
  host     : c.MYSQL_HOST,
  port     : c.MYSQL_PORT,
  user     : c.MYSQL_USER,
  password : c.MYSQL_PWD,
  database : c.MYSQL_DB,
  dateStrings: true,
})

const formatString = (string) => {
  return string.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

let writeStream = fs.createWriteStream('users.csv', {encoding:'utf8',flag:'w'})

const processRow = (row) => {
  let output = ''

  for (const key in row) {
    if (typeof row[key] === 'number') {
      output += row[key]
    } else if (typeof row[key] === 'string') {
      output += `"${formatString(row[key])}"`
    } else {
      output += 'null'
    }

    if (key !== lastField) {
      output += ','
    }
  }

  output += '\n'

  writeStream.write(output)
}

var query = connection.query(`
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
`)
query
  .on('error', function(err) {
    // Handle error, an 'end' event will be emitted after this as well
    console.log(err)
  })
  .on('fields', function(fields) {
    let output = ''

    for (f of fields) {
      output += `"${f.name}"`

      if (f.name !== lastField) {
        output += ','
      }
    }

    output += '\n'

    writeStream.write(output)
  })
  .on('result', processRow)
  .on('end', function() {
    // all rows have been received
    console.log('end')
    connection.end()
  })


