# bmwccapsr-website-gatsby

## About

This repo is the source for the website of the BMW Car Club of America Puget Sound Region Chapter (BMWCCAPSR). The club has been around since 1969 and has helped connect BMW enthusiests from all over the Puget Sound area enjoy their vehicles to the fullest. We offer social events, tech sessions, track days, driving tours and many more benefits of membership. 

This repo tracks the project source for the club website including AWS CDK infrastrucuture code as well as gatsby and sanity config files. The web root of the gatsby project is `bmwccapsrwebsite`. 

## Tech stack used
* gatsbyJS
* ThemeUI
* Sanity CMS

## Setup
### Getting started
Setup requires an AWS account created with a corresponding iam credential and access key.

* Install the AWS CLI and authenticate with the account and your iam access key using `aws configure`
* Login to [github and create a personal access token here](https://github.com/settings/tokens)
* Retrieve credentials to [docker](https://www.docker.com/) or create a pro account. This is required to authenticate to docker hub and overcome the `rateExceeded` error message when pulling against docker hub.
* Create secret keys and parameters:
```
aws ssm put-parameter \
    --name GITHUB_OWNER \
    --type String \
    --value BMW-CCA-PSR

aws ssm put-parameter \
    --name GITHUB_REPO \
    --type String \
    --value bmwccapsr-website-gatsby

aws secretsmanager create-secret \
    --name GITHUB_TOKEN \
    --secret-string <your_personal_access_token_from_github_here>

aws secretsmanager create-secret \
    --name DOCKER_USER \
    --secret-string
    <your_docker_username_here>

aws secretsmanager create-secret \
    --name DOCKER_PWD \
    --secret-string
    <your_docker_password_here>
```

### Deploy Infrastructure
#### Amplify resources

`cd infra && npm install && npm run build && cdk deploy AmplifyStack`

#### Gatsby Preview Server resources

`cdk deploy `
