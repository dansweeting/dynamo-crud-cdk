import { v4 as guid } from 'uuid'

describe('CRUD API', () => {

    const { API_BASE_URL } = process.env
    const apiBaseUrl = `${API_BASE_URL}/rest-resource`

    it('GET nonexistent item is a 404', async () => {
        const url = `${apiBaseUrl}/${guid()}`

        const response = await fetch(url, { method: 'GET'})

        expect(response.status).toBe(404)
    })

    it('PUT item is a 200', async () => {
        const url = `${apiBaseUrl}/${guid()}`

        const response = await fetch(url, { method: 'PUT', body: JSON.stringify({ foo: 'bar'}) })

        expect(response.status).toBe(200)
    })

    it('GET after PUT', async () => {
        const id = guid()
        const url = `${apiBaseUrl}/${id}`

        const resource = { foo: 'bar', child: { foo: 'child bar'}}
        const putResponse = await fetch(url, { method: 'PUT', body: JSON.stringify(resource) })

        expect(putResponse.status).toBe(200)

        const getResponse = await fetch(url, { method: 'GET'})
        expect(getResponse.status).toBe(200)

        const expectedJson = {
            id,
            sortKey: 'latest',
            version: 1,
            ...resource
        }

        const actualJson = await getResponse.json()

        expect(actualJson).toEqual(expectedJson);
    })
})