import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import path = require('path');
import { HostedZone } from '@aws-cdk/aws-route53';
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');

export class EcsInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = `bmw-club-psr.org`
    const hostedZone = HostedZone.fromLookup(this,domain,{domainName: domain})

    // Preview server docker 

    const cluster = new ecs.Cluster(this, 'PreviewServerCluster');
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "PreviewServer", {
    cluster,
    taskImageOptions: {
        image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../../web')),
    },
    desiredCount: 1,
    });
  }
}