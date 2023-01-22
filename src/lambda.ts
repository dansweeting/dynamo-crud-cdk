import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler} from 'aws-lambda'

export const getResource: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>
    = async(event, context) => {
    const id = event?.pathParameters?.id

    return {
        statusCode: 200,
        body: JSON.stringify({ id })
    }
}

