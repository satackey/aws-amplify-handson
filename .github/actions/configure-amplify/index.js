const core = require('@actions/core')
// const github = require('@actions/github')
const exec = require('@actions/exec')

;(async () => {
  const awsAccessKeyId = core.getInput('access-key-id', { required: true })
  const awsSecretAccessKey = core.getInput('secret-access-key', { required: true })
  const awsRegion = core.getInput('region', { required: true })
  const amplifyProjectName = core.getInput('project-name', { required: true })
  const amplifyAppId = core.getInput('app-id', { required: true })
  const amplifyEnvName = core.getInput('env-name', { required: true })

  core.startGroup('Install Amplify CLI')
  await exec.exec('npm i -g @aws-amplify/cli')
  // await exec.exec('yarn global bin')
  let nodeGlobalBin = ''
  await exec.exec('npm root -g', undefined, {
    listeners: {
      stdout: data => {
        nodeGlobalBin += data.toString().replace('\n', '')
      }
    }
  })
  console.log(JSON.stringify({ nodeGlobalBin }))
  core.addPath(nodeGlobalBin)
  core.endGroup()

  let envPath = ''
  await exec.exec('sh -c "echo $PATH"', undefined, {
    listeners: {
      stdout: data => {
        envPath += data.toString().replace('\n', '')
      }
    }
  })
  console.log(envPath)
  await exec.exec('whereis node')

  core.startGroup('amplify pull')
  // const reactConfig = {
  //   SourceDir: 'frontend/src',
  //   DistributionDir: 'frontend/build',
  //   BuildCommand: 'docker-compose -f ../docker-compose.yml run frontend_dev yarn build',
  //   StartCommand: 'docker-compose -f ../docker-compose.yml up',
  // }

  const awsCloudFormationConfig = {
    configLevel: 'project',
    useProfile: false,
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
    region: awsRegion,
  }

  const amplify = {
    projectName: amplifyProjectName,
    appId: amplifyAppId,
    envName: amplifyEnvName,
    defaultEditor: 'none',
  }

  const providers = {
    awscloudformation: awsCloudFormationConfig,
  }

  await exec.exec(`amplify`,
    [
      'pull',
      '--yes',
      '--amplify', JSON.stringify(amplify),
      '--providers', JSON.stringify(providers),
    ],
    {
      env: {
        'PATH': envPath, // avoid `/usr/bin/env: 'node': No such file or directory`
        'AWS_ACCESS_KEY_ID': awsAccessKeyId,
        'AWS_SECRET_ACCESS_KEY': awsSecretAccessKey,
        'AWS_REGION': awsRegion,
      }
    }
  )
  core.endGroup()
})().catch(e => {
  core.setFailed(e.message)
})
