import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AmplifyInfra from '../lib/amplify-infra-stack';

test('Amplify app stack synthesizes', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AmplifyInfra.AmplifyInfraStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(
      haveResource('AWS::Amplify::App', {
        Name: 'bmwccapsr-website'
      })
    );
});
