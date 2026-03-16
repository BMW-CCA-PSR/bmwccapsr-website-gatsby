import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { MsrSanityEventsSyncStack } from "../lib/msr-sanity-events-sync-stack";

test("creates DynamoDB tables for MSR sync", () => {
  const app = new cdk.App();

  const stack = new MsrSanityEventsSyncStack(app, "MsrSanityEventsSyncStackTest", {
    env: {
      account: "111111111111",
      region: "us-west-2",
    },
  });

  expectCDK(stack).to(
    haveResource("AWS::DynamoDB::Table", {
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
    })
  );
});

