import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CognitoRemixDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const cogntioUserPool = new cognito.UserPool(this, 'CognitoRemixDemoUserPool', {
      autoVerify: { email: true },
      userVerification: {
        emailSubject: "Verify your email for our awesome app!",
        emailBody: "Thanks for signing up to our awesome app! Your verification code is {####}",
      },
      signInAliases: { email: true },
      userPoolName: 'CognitoRemixDemoUserPool',
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'CognitoRemixDemoUserPoolClient', {
      userPool: cogntioUserPool,
      userPoolClientName: 'CognitoRemixDemoUserPoolClient',
      authFlows: {
        userSrp: true,
        adminUserPassword: true,
        userPassword: true,
      }
    });

    new cdk.CfnOutput(this, 'CognitoRemixDemoUserPoolId', {
      value: cogntioUserPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'CognitoRemixDemoUserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CognitoRemixDemoQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
