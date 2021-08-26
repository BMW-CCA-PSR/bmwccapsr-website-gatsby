import cdk = require('@aws-cdk/core');
import amplify = require("@aws-cdk/aws-amplify");
import ssm = require("@aws-cdk/aws-ssm");

import { 
  AMPLIFY_PROJECT_NAME,
  DOMAIN,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GATSBY_SANITY_TOKEN,
  GATSBY_SANITY_PROJECT_ID
} from '../config';

export class AmplifyInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // setup amplify app to github

    const secret = cdk.SecretValue.secretsManager(GITHUB_TOKEN, {
      jsonField: "Token"
    });
    const repo = ssm.StringParameter.valueForStringParameter(this, GITHUB_REPO);
    const owner = ssm.StringParameter.valueForStringParameter(this, GITHUB_OWNER);
    const amplifyApp = new amplify.App(this, AMPLIFY_PROJECT_NAME, {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: owner,
        repository: repo,
        oauthToken: secret,
      }),
    });

    // branch setup

    const masterBranch = amplifyApp.addBranch("master");
    const devBranch = amplifyApp.addBranch("dev");

    // domain setup

    amplifyApp.addDomain("domain",{
      domainName: DOMAIN,
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
    const token = cdk.SecretValue.secretsManager(GATSBY_SANITY_TOKEN);
    const project = ssm.StringParameter.valueForStringParameter(this, GATSBY_SANITY_PROJECT_ID);
    amplifyApp.addEnvironment("GATSBY_SANITY_PROJECT_ID", project)
    amplifyApp.addEnvironment("GATSBY_SANITY_TOKEN", token.toString())

    // prod env vars
    masterBranch.addEnvironment("STAGE", "prod");
    masterBranch.addEnvironment("GATSBY_SANITY_DATASET", "production");

    // dev env vars
    devBranch.addEnvironment("STAGE", "dev");
    devBranch.addEnvironment("GATSBY_SANITY_DATASET", "beta");

  }
}
