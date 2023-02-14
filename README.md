# AWS Cognito and Remix demo

This demo project demonstrates how to log a user into a remix project using AWS apis.

## Getting Started
Install CDK deps + the cdk project to spin up a new cognito pool and cogito client id. 

1. Install any necessary dependencies in CDK project
2. Run `cdk deploy CognitoRemixDemoStack` in your terminal -  will spin up a new cognito pool and cogito client id. 
4. Fill out remix .env variables (see .env.example)
3. After CDK deploy - grab userpool + client ids from outputs and paste into new remix .env file
4. Install any necessary dependencies in remix project
5. Run `yarn build`
6. Run `yarn dev`
7. Navigate to http://localhost:3000/ in your browser.
8. In the AWS console, navigate to Cognito pool and add user. Choose to verify email at this time and to send email of temp password.
9. Log in
