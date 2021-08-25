import cdk = require('@aws-cdk/core');
import ecs = require("@aws-cdk/aws-ecs");
import ecsPatterns = require("@aws-cdk/aws-ecs-patterns");
import route53 = require("@aws-cdk/aws-route53");
import ecr = require('@aws-cdk/aws-ecr');
import { ClusterInfraStack } from './cluster-infra-stack';

import { 
    ECR_REPO_NAME, 
    FARGATE_SERVICE_NAME,
    DOMAIN,
    PREVIEW,
    GATSBY_SANITY_PROJECT_ID,
    GATSBY_SANITY_DATASET,
    GATSBY_SANITY_TOKEN
} from '../../config';


interface EcsInfraStackProps {
    readonly cluster: ClusterInfraStack;
}

class EcsInfraStack extends cdk.Construct {
    private fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

    public readonly service: ecs.IBaseService;
    public readonly containerName: string;
    public readonly ecrRepo: ecr.Repository;

    previewSubdomain = `${PREVIEW}.${DOMAIN}`

    constructor(scope: cdk.Construct, id: string, props: EcsInfraStackProps) {
        super(scope, id);
        const hostedZone = new route53.HostedZone(this, "HostedZone", {
            zoneName: this.previewSubdomain
        })
        const nameServers: string[] = hostedZone.hostedZoneNameServers!;
        const rootZone = route53.HostedZone.fromLookup(this, "Zone", {
            domainName: DOMAIN
          });
        new route53.ZoneDelegationRecord(this, "Delegation", {
            recordName: this.previewSubdomain,
            nameServers,
            zone: rootZone,
            ttl: cdk.Duration.minutes(1)
        });
        this.fargateService = this.createService(props.cluster.ecsCluster, hostedZone);
        this.ecrRepo = new ecr.Repository(this, ECR_REPO_NAME);
        this.ecrRepo.grantPull(this.fargateService.taskDefinition.executionRole!);
        this.service = this.fargateService.service;
        this.fargateService.targetGroup.configureHealthCheck({
            interval: cdk.Duration.seconds(300),
            timeout: cdk.Duration.seconds(120),
            healthyHttpCodes: "200,304"
        })
        this.containerName = this.fargateService.taskDefinition.defaultContainer!.containerName;

        this.output();
    }

    private createService(cluster: ecs.Cluster, zone: route53.HostedZone) {
        const token = cdk.SecretValue.secretsManager(GATSBY_SANITY_TOKEN);
        return new ecsPatterns.ApplicationLoadBalancedFargateService(this, FARGATE_SERVICE_NAME, {
            cluster: cluster,
            cpu: 512,
            memoryLimitMiB: 2048,
            domainName: this.previewSubdomain,
            domainZone: zone,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('../web'),
                environment: {
                    "GATSBY_SANITY_PROJECT_ID": GATSBY_SANITY_PROJECT_ID,
                    "GATSBY_SANITY_DATASET": GATSBY_SANITY_DATASET,
                    "GATSBY_SANITY_TOKEN": token.toString()
                }
            }
        });
    }

    private output() {
        new cdk.CfnOutput(this, 'ECRRepo_ARN', { value: this.ecrRepo.repositoryArn });
        new cdk.CfnOutput(this, 'ContainerName', { value: this.containerName });
    }
}

export { EcsInfraStack, EcsInfraStackProps };