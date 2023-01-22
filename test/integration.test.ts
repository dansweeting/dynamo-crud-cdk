describe('CRUD API', () => {

    const { API_BASE_URL: apiBaseUrl = '' } = process.env

    it('GET nonexistent item is a 404', async () => {
        const url = `${apiBaseUrl}/rest-resource/blahblah`

        const response = await fetch(url)

        expect(response.status).toBe(404)
    })
})