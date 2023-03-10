import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as awsLambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path'

export class Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, "dynamoDbTable", {
            tableName: 'versionedCrudItems',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING},
            sortKey: { name: 'sortKey', type: dynamodb.AttributeType.STRING},
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const lambdaGetResource = new awsLambda.Function(this,'lambdaGetResource',{
            functionName: 'getResource',
            runtime: awsLambda.Runtime.NODEJS_18_X,
            handler: 'lambda.getResource',
            code: awsLambda.Code.fromAsset(path.join(__dirname, '../../tsc.out/src')),
            environment: {
                DYNAMO_TABLE_NAME: table.tableName,
            }
        })

        const lambdaPutResource = new awsLambda.Function(this,'lambdaPutResource',{
            functionName: 'putResource',
            runtime: awsLambda.Runtime.NODEJS_18_X,
            handler: 'lambda.putResource',
            code: awsLambda.Code.fromAsset(path.join(__dirname, '../../tsc.out/src')),
            environment: {
                DYNAMO_TABLE_NAME: table.tableName,
            }
        })

        table.grantReadData(lambdaGetResource)
        table.grantReadWriteData(lambdaPutResource)

        const restApi = new apigateway.RestApi(this, 'apiGateway', {
            restApiName: 'crudRestApi',
        })

        const resource = restApi.root.resourceForPath('rest-resource/{id}')
        resource.addMethod('GET', new apigateway.LambdaIntegration(
            lambdaGetResource,
        ));
        resource.addMethod('PUT', new apigateway.LambdaIntegration(
            lambdaPutResource,
        ));

        new cdk.CfnOutput(this, 'crudRestApiUrl', { value: restApi.url })
    }
}
