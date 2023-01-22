import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler} from 'aws-lambda'
import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

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

export const getResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>
    = async(event, context) => {
    const id = event?.pathParameters?.id

    const retrievedItem = await getItem(id, 'latest')

    if (retrievedItem === undefined) {
        return {
            statusCode: 404,
            body: 'no item found'
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(retrievedItem)
    }
}

const hasConflict = async (id: string | undefined, version: number): Promise<Boolean> => {
    return await getItem(id, version.toString()) !== undefined
}

export const putResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>
    = async(event, context) => {
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
        { version, sortKey: 'latest'},
    ].map( ({ version, sortKey }) =>
        documentClient.put({
            TableName,
            Item: {
                ...body,
                id,
                version,
                sortKey
            },
        })
    )

    await Promise.all(itemUpdates)

    return { statusCode: 200 }
}
