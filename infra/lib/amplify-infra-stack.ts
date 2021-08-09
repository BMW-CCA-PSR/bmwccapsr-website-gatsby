import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import { App } from '@aws-cdk/core';

export class AmplifyInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const amplifyApp = new amplify.App(this, "bmwccapsr-website", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: "ebox86",
        repository: "bmwccapsr-website-gatsby",
        oauthToken: cdk.SecretValue.secretsManager("GitHubToken-Amplify", {
          jsonField: "Token"
        }),
      }),
    });

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
