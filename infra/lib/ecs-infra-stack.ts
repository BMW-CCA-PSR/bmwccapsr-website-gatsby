import cdk = require('@aws-cdk/core');
import ecs = require("@aws-cdk/aws-ecs");
import ecsPatterns = require("@aws-cdk/aws-ecs-patterns");
import ecr = require('@aws-cdk/aws-ecr');
import { CfnOutput } from '@aws-cdk/core';
import { ClusterInfraStack } from './cluster-infra-stack';

interface EcsInfraStackProps {
    readonly cluster: ClusterInfraStack;
}

class EcsInfraStack extends cdk.Construct {
    private fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

    public readonly service: ecs.IBaseService;
    public readonly containerName: string;
    public readonly ecrRepo: ecr.Repository;

    constructor(scope: cdk.Construct, id: string, props: EcsInfraStackProps) {
        super(scope, id);
        this.fargateService = this.createService(props.cluster.ecsCluster);
    
        this.ecrRepo = new ecr.Repository(this, 'GatsbyPreviewECRRepo');
        this.ecrRepo.grantPull(this.fargateService.taskDefinition.executionRole!);
        this.service = this.fargateService.service;
        this.containerName = this.fargateService.taskDefinition.defaultContainer!.containerName;

        this.output();
    }

    private createService(cluster: ecs.Cluster) {
        return new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'GatsbyPreviewService', {
            cluster: cluster,
            desiredCount: 1,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('../web'),
            }
        });
    }

    private output() {
        new CfnOutput(this, 'ECRRepo_ARN', { value: this.ecrRepo.repositoryArn });
        new CfnOutput(this, 'ContainerName', { value: this.containerName });
    }
}

export { EcsInfraStack, EcsInfraStackProps };