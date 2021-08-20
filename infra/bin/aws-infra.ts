#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AmplifyInfraStack } from '../lib/amplify-infra-stack';
import { EcsInfraStack } from '../lib/ecs-infra-stack';

const app = new cdk.App();
const props = { 
  account: '992166107237', 
  region: 'us-west-2',
  githubOwner: 'ebox86',
  githubRepo: 'bmwccapsr-website-gatsby',
  githubAccessToken: 'GitHubToken-Amplify',
  domainName: 'bmw-club-psr.org'
}
new AmplifyInfraStack(app, 'AmplifyInfraStack', {
  env: props,
});
new EcsInfraStack(app, 'EcsInfraStack', {
  env: props,
});

