import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as awsLambda from "aws-cdk-lib/aws-lambda";
import * as path from 'path'

export class Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, "dynamoDbTable", {
            tableName: 'versionedCrudItems',
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING},
            sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER},
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const lambdaGetResource = new awsLambda.Function(this,'lambdaGetResource',{
            functionName: 'getResource',
            runtime: awsLambda.Runtime.NODEJS_18_X,
            handler: 'lambda.getResource',
            code: awsLambda.Code.fromAsset(path.join(__dirname, '../../tsc.out/')),
        })

        table.grantReadData(lambdaGetResource)
    }
}
