import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import { App } from '@aws-cdk/core';
import path = require('path');
import {core,
  aws_ecs, 
  aws_ecs_patterns,
  aws_iam,
  aws_ec2
 } from aws_cdk 

export class AmplifyInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // setup amplify app to github

    const amplifyApp = new amplify.App(this, "bmwccapsr-website", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: "ebox86",
        repository: "bmwccapsr-website-gatsby",
        oauthToken: cdk.SecretValue.secretsManager("GitHubToken-Amplify", {
          jsonField: "Token"
        }),
      }),
    });

    // branch setup

    const masterBranch = amplifyApp.addBranch("master");
    const devBranch = amplifyApp.addBranch("dev");

    // domain setup

    amplifyApp.addDomain("domain",{
      domainName: "bmw-club-psr.org",
      subDomains: [
        {
          branch: devBranch,
          prefix: "beta"
        },
        {
          branch: masterBranch,
          prefix: ""
        }
      ]
    })

    // app env vars

    amplifyApp.addEnvironment("GATSBY_SANITY_PROJECT_ID", "clgsgxc0")
    amplifyApp.addEnvironment("GATSBY_SANITY_TOKEN", "replace_me")

    // prod env vars
    masterBranch.addEnvironment("STAGE", "prod");
    masterBranch.addEnvironment("GATSBY_SANITY_DATASET", "production");

    // dev env vars
    devBranch.addEnvironment("STAGE", "dev");
    devBranch.addEnvironment("GATSBY_SANITY_DATASET", "beta");

      // Preview server docker 
      // dev

      const role = aws_iam.Role(this, "FargateContainerRole", aws_iam.ServicePrincipal("ecs-tasks.amazonaws.com"))
      const vpc = new aws_ec2.Vpc(this, "PreviewServerVPC", { maxAzs: 2 });
      const cluster = new aws_ecs.Cluster(this, 'Cluster', { vpc }); 

      new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
        cluster,
        taskImageOptions: {
          image: aws_ecs.ContainerImage.fromAsset(path.resolve(__dirname, 'local-image'))
        },
      });
  }
}
