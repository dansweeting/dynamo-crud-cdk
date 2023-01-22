import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {AttributeType, BillingMode} from 'aws-cdk-lib/aws-dynamodb';

export class Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, "dynamoDbTable", {
            tableName: 'versionedCrudItems',
            partitionKey: { name: 'id', type: AttributeType.STRING},
            sortKey: { name: 'version', type: AttributeType.NUMBER},
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }
}
