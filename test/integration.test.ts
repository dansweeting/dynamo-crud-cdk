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
})