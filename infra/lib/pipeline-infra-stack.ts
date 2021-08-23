import cdk = require('@aws-cdk/core');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import ssm = require("@aws-cdk/aws-ssm");
import ecr = require('@aws-cdk/aws-ecr');
import ecs = require('@aws-cdk/aws-ecs');
import { EcsInfraStack } from './ecs-infra-stack';

interface PipelineProps {
  readonly ecs: EcsInfraStack;
}

class PipelineInfraStack extends cdk.Construct {
  private readonly ecs: EcsInfraStack;

  readonly service: ecs.IBaseService;
  readonly containerName: string;
  readonly ecrRepo: ecr.Repository;

  public readonly pipeline: codepipeline.Pipeline;

  constructor(scope: cdk.Construct, id: string, props: PipelineProps) {
    super(scope, id);
    this.ecs = props.ecs;
    this.service = this.ecs.service;
    this.ecrRepo = this.ecs.ecrRepo;
    this.containerName = this.ecs.containerName;

    this.pipeline = this.createPipeline();
    this.output();
  }

  private createPipeline(): codepipeline.Pipeline {
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();
    return new codepipeline.Pipeline(this, 'Pipeline', {
      stages: [
        this.createSourceStage('Source', sourceOutput),
        this.createImageBuildStage('Build', sourceOutput, buildOutput),
        this.createDeployStage('Deploy', buildOutput),
      ]
    });
  }

  private createSourceStage(stageName: string, output: codepipeline.Artifact): codepipeline.StageProps {
    const secret = cdk.SecretValue.secretsManager("GitHubToken-Amplify", {
      jsonField: "Token"
    });
    const repo = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_REPO');
    const owner = ssm.StringParameter.valueForStringParameter(this, 'GITHUB_OWNER');
    const githubAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'Github_Source',
      owner: owner,
      repo: repo,
      oauthToken: secret,
      output: output,
      branch: 'master'
    });
    return {
      stageName: stageName,
      actions: [githubAction],
    };
  }

  private createImageBuildStage(
    stageName: string,
    input: codepipeline.Artifact,
    output: codepipeline.Artifact
  ): codepipeline.StageProps {
    const project = new codebuild.PipelineProject(
      this,
      'GatsbyPreviewProject',
      {
        buildSpec: this.createBuildSpec(),
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
          privileged: true,
        },
        environmentVariables: {
          REPOSITORY_URI: { value: this.ecrRepo.repositoryUri },
          CONTAINER_NAME: { value: this.containerName }
        }
      }
    );
    this.ecrRepo.grantPullPush(project.grantPrincipal);

    const codebuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild_Action',
      input: input,
      outputs: [output],
      project: project,
    });

    return {
      stageName: stageName,
      actions: [codebuildAction],
    };
  }

  createDeployStage(stageName: string, input: codepipeline.Artifact): codepipeline.StageProps {
    const ecsDeployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'ECSDeploy_Action',
      input: input,
      service: this.service,
    });
    return {
      stageName: stageName,
      actions: [ecsDeployAction],
    }
  }

  createBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          'runtime-versions': {
            'nodejs': '10'
          },
          commands: [
            'npm install -g npm',
          ],
        },
        pre_build: {
          commands: [
            'cd web',
            '$(aws ecr get-login --no-include-email | sed \'s|https://||\')',
            'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
            'IMAGE_TAG=${COMMIT_HASH:=latest}'
          ]
        },
        build: {
          commands: [
            'docker build -t $REPOSITORY_URI:latest .',
            'docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG',
          ]
        },
        post_build: {
          commands: [
            'cd ../',
            'docker push $REPOSITORY_URI:latest',
            'docker push $REPOSITORY_URI:$IMAGE_TAG',
            'printf "[{\\"name\\":\\"${CONTAINER_NAME}\\",\\"imageUri\\":\\"${REPOSITORY_URI}:latest\\"}]" > imagedefinitions.json'
          ]
        }
      },
      artifacts: {
        files: [
          'imagedefinitions.json'
        ]
      }
    });
  }

  output() {
    new cdk.CfnOutput(this, 'Pipeline ARN', { value: this.pipeline.pipelineArn })
  }
}

export { PipelineInfraStack, PipelineProps };