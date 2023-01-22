import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const { DYNAMO_TABLE_NAME: TableName } = process.env

const dbClient = new DynamoDBClient({})
const documentClient = DynamoDBDocument.from(dbClient)

const getItem = async (id: string | undefined, sortKey: string) => {
  const { Item } = await documentClient.get({
    TableName,
    Key: {
      id,
      sortKey
    }
  })

  return Item
}

export const getResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> =
    async (event, context) => {
      const id = event?.pathParameters?.id

      const retrievedItem = await getItem(id, 'latest')

      if (retrievedItem === undefined) {
        return {
          statusCode: 404,
          body: 'no item found'
        }
      }

      delete retrievedItem.sortKey

      return {
        statusCode: 200,
        body: JSON.stringify(retrievedItem)
      }
    }

const hasConflict = async (id: string | undefined, version: number): Promise<Boolean> => {
  const [preExistingItem, latestItem = {}] = await Promise.all([
    getItem(id, version.toString()),
    getItem(id, 'latest')
  ])

  if (preExistingItem !== undefined) {
    console.log(`PUT conflict: Detected an item clashing with id ${id} and version ${version}.`)
    return true
  }

  const latestVersion = latestItem.version ?? 0
  const expectedNextVersion = Number(latestVersion) + 1
  if (version !== expectedNextVersion) {
    console.log(`PUT conflict: Attempted to create new version for id ${id} version ${version}, when the expected next version number is ${expectedNextVersion}.`)
    return true
  }

  return false
}

export const putResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> =
    async (event, context) => {
      const id = event?.pathParameters?.id

      const body = JSON.parse(event?.body || '{}')

      const { version = 1 } = body

      if (await hasConflict(id, version)) {
        return {
          statusCode: 409
        }
      }

      const itemUpdates = [
        { version, sortKey: version.toString() },
        { version, sortKey: 'latest' }
      ].map(async ({ version, sortKey }) =>
        await documentClient.put({
          TableName,
          Item: {
            ...body,
            id,
            version,
            sortKey
          }
        })
      )

      await Promise.all(itemUpdates)

      return { statusCode: 200 }
    }
