const c = require('../config')
const fs = require('fs')
const mysql = require('mysql')

const formatString = (string) => {
  return string.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

const processRow = (writeStream, lastField) => (row) => {
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

module.exports = () => {
  return {
    createCsv: (path, sql, lastField) => {

      const connection = mysql.createConnection({
        host       : c.MYSQL_HOST,
        port       : c.MYSQL_PORT,
        user       : c.MYSQL_USER,
        password   : c.MYSQL_PWD,
        database   : c.MYSQL_DB,
        dateStrings: true,
      })

      return new Promise((resolve, reject) => {
        let writeStream = fs.createWriteStream(path, { encoding: 'utf8', flag: 'w' })
        let query = connection.query(sql)

        query
          .on('error', function(err) {
            // Handle error, an 'end' event will be emitted after this as well
            console.log(err)
            reject(err)
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
          .on('result', (processRow(writeStream, lastField)))
          .on('end', function() {
            writeStream.end()
            connection.end()
            console.log(`Done ${path}`)
            resolve()
          })
      })
    }
  }
}
