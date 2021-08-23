import cdk = require('@aws-cdk/core');
import ecs = require("@aws-cdk/aws-ecs");
import ecr = require('@aws-cdk/aws-ecr');
import { CfnOutput } from '@aws-cdk/core';

class ClusterInfraStack extends cdk.Construct {
 readonly ecsCluster: ecs.Cluster;

 constructor(scope: cdk.Construct, id: string) {
 super(scope, id);
 this.ecsCluster = new ecs.Cluster(this, 'GatsbyPreviewCluster');
 this.output();
 }

 output() {
 new CfnOutput(this, 'GatsbyPreviewCluster_ARN', {value: this.ecsCluster.clusterArn});
 }
}

export {ClusterInfraStack};