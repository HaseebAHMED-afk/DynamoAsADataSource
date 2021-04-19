import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync'
import * as lambda from '@aws-cdk/aws-dynamodb'
import * as dbb from '@aws-cdk/aws-dynamodb'

export class DynamoAsDsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this , "GRAPHQL_API", {
      name: 'cdk-api',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig:{
        defaultAuthorization:{
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig:{
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        }
      },
      xrayEnabled: true
    })

    new cdk.CfnOutput(this, "APIGraphQLUrl" , {
      value: api.graphqlUrl
    })

    new cdk.CfnOutput(this , "GraphQLAPIKey" , {
      value: api.apiKey || ``
    })

    const dynamotable = new dbb.Table(this , "DynamoTable",{
      partitionKey:{
        name: 'id',
        type: dbb.AttributeType.STRING
      }
    })

    const db_datasource = api.addDynamoDbDataSource('DataSource' , dynamotable);

    db_datasource.createResolver({
      typeName:'Mutation',
      fieldName:'createNote',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition('id').auto(),
        appsync.Values.projecting()
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    db_datasource.createResolver({
      typeName:'Query',
      fieldName: 'notes',
      requestMappingTemplate:appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()
    })


    db_datasource.createResolver({
      typeName:'Mutation',
      fieldName:'deleteNote',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id' , 'id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    db_datasource.createResolver({
      typeName:'Mutation',
      fieldName:'updateNote',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition('id').is('id'),
        appsync.Values.projecting()
      ),

      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()
    })
  }
}
