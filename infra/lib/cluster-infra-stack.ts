import cdk = require("@aws-cdk/core");
import ecs = require("@aws-cdk/aws-ecs");

import { CLUSTER_NAME } from "../../config";

class ClusterInfraStack extends cdk.Construct {
  readonly ecsCluster: ecs.Cluster;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    this.ecsCluster = new ecs.Cluster(this, CLUSTER_NAME);
    this.output();
  }

  output() {
    new cdk.CfnOutput(this, "Cluster_ARN", { value: this.ecsCluster.clusterArn });
  }
}

export { ClusterInfraStack };
