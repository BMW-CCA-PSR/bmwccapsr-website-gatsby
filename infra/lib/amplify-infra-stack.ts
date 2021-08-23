import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";
import ssm = require("@aws-cdk/aws-ssm");


export class AmplifyInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // setup amplify app to github

    const secret = cdk.SecretValue.secretsManager("GitHubToken-Amplify", {
      jsonField: "Token"
    });
    const repo = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_REPO');
    const owner = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_OWNER');
    const amplifyApp = new amplify.App(this, "bmwccapsr-website", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: owner,
        repository: repo,
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
