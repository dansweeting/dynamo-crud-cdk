import { v4 as guid } from 'uuid'

describe('CRUD API', () => {
  const { API_BASE_URL } = process.env
  const apiBaseUrl = `${API_BASE_URL}/rest-resource`

  it('GET nonexistent item is a 404', async () => {
    const url = `${apiBaseUrl}/${guid()}`

    const response = await fetch(url, { method: 'GET' })

    expect(response.status).toBe(404)
  })

  it('PUT item is a 200', async () => {
    const url = `${apiBaseUrl}/${guid()}`

    const response = await fetch(url, { method: 'PUT', body: JSON.stringify({ foo: 'bar' }) })

    expect(response.status).toBe(200)
  })

  it('GET after PUT', async () => {
    const id = guid()
    const url = `${apiBaseUrl}/${id}`

    const resource = { foo: 'bar', child: { foo: 'child bar' } }
    const putResponse = await fetch(url, { method: 'PUT', body: JSON.stringify(resource) })

    expect(putResponse.status).toBe(200)

    const getResponse = await fetch(url, { method: 'GET' })
    expect(getResponse.status).toBe(200)

    const expectedJson = {
      id,
      version: 1,
      ...resource
    }

    const actualJson = await getResponse.json()

    expect(actualJson).toEqual(expectedJson)
  })

  it('PUT is valid when version is incremented', async () => {
    const id = guid()
    const url = `${apiBaseUrl}/${id}`

    const resource = { foo: 'bar', child: { foo: 'child bar' } }
    const putResponseOne = await fetch(url, { method: 'PUT', body: JSON.stringify(resource) })

    expect(putResponseOne.status).toBe(200)

    const getResponseOne = await fetch(url, { method: 'GET' })
    expect(getResponseOne.status).toBe(200)

    const versionOne = await getResponseOne.json()

    const putResponseTwo = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        ...versionOne,
        foo: 'baz',
        version: 2
      })
    })

    expect(putResponseTwo.status).toBe(200)
    const getResponseTwo = await fetch(url, { method: 'GET' })
    const actualResponseTwo = await getResponseTwo.json()

    const expectedResponseTwo = expect.objectContaining({
      version: 2,
      foo: 'baz'
    })

    expect(actualResponseTwo).toEqual(expectedResponseTwo)
  })

  it('PUT with existing version number is a 409 conflict', async () => {
    const id = guid()
    const url = `${apiBaseUrl}/${id}`

    const resource = { foo: 'bar', child: { foo: 'child bar' } }
    const putResponseOne = await fetch(url, { method: 'PUT', body: JSON.stringify(resource) })

    expect(putResponseOne.status).toBe(200)

    const getResponseOne = await fetch(url, { method: 'GET' })
    expect(getResponseOne.status).toBe(200)

    const versionOne = await getResponseOne.json()

    const putResponseTwo = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        ...versionOne,
        foo: 'baz',
        version: 1 // trying PUT a stale version is a version conflict.
      })
    })

    expect(putResponseTwo.status).toBe(409)
  })

  it('PUT with out-of-order version number is a 409 conflict', async () => {
    const id = guid()
    const url = `${apiBaseUrl}/${id}`

    const resource = { foo: 'bar', child: { foo: 'child bar' } }
    const putResponseOne = await fetch(url, { method: 'PUT', body: JSON.stringify(resource) })

    expect(putResponseOne.status).toBe(200)

    const getResponseOne = await fetch(url, { method: 'GET' })
    expect(getResponseOne.status).toBe(200)

    const versionOne = await getResponseOne.json()

    const putResponseTwo = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        ...versionOne,
        foo: 'baz',
        version: 99 // since the expected next version is 2
      })
    })

    expect(putResponseTwo.status).toBe(409)
  })
})
