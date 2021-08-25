#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AmplifyInfraStack } from '../lib/amplify-infra-stack';
import { EcsInfraStack } from '../lib/ecs-infra-stack';
import { PipelineInfraStack } from '../lib/pipeline-infra-stack';
import { ClusterInfraStack } from '../lib/cluster-infra-stack';

const env = { 
  account: '992166107237', 
  region: 'us-west-2'
}

class GatsbyPreviewInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
  super(scope, id, props);
  const cluster = new ClusterInfraStack(this, 'ClusterInfraStack');
  const ecs = new EcsInfraStack(this, 'EcsInfraStack', {
    cluster: cluster
  });
  const pipeline = new PipelineInfraStack(this, 'PipelineInfraStack', {
    ecs: ecs
  });
  }
}

// stacks
const app = new cdk.App();
new GatsbyPreviewInfraStack(app, 'GatsbyPreviewInfraStack', {env: env});
new AmplifyInfraStack(app, 'AmplifyInfraStack',{env: env});
app.synth();