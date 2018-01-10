require('whatwg-fetch')

const searchApiUrl = 'http://localhost:3000'

test('test api', async () => {
  const data = {
    skills: [],
    professions: [],
    levels: [],
    locations: [],
    availabilities: [],
  }

  const response = await fetch(`${searchApiUrl}/users4?idsOnly=true`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const responseJson = await response.json()

  expect(responseJson.users).toBeDefined()
})
