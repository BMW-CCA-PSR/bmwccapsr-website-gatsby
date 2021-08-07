import * as cdk from '@aws-cdk/core';
import * as amplify from "@aws-cdk/aws-amplify";

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

    masterBranch.addEnvironment("STAGE", "prod");
    devBranch.addEnvironment("STAGE", "dev");
  }
}
