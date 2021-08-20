import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import path = require('path');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');

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

  }
}
