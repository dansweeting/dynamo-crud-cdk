import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler} from 'aws-lambda'
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const { DYNAMO_TABLE_NAME: TableName } = process.env

const dbClient = new DynamoDBClient({})
const documentClient = DynamoDBDocument.from(dbClient)

export const getResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>
    = async(event, context) => {
    const id = event?.pathParameters?.id

    const document = await documentClient.get({
        TableName,
        Key: {
            id,
            version: 0
        }
    })

    console.log({document})

    return {
        statusCode: 200,
        body: JSON.stringify({ id })
    }
}

