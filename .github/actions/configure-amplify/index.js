const core = require('@actions/core')
const exec = require('@actions/exec')

const execAsync = async (command, args, options) => {
  let stdout = ''
  let stderr = ''

  const exit = await exec.exec(command, args, {
    listeners: {
      stdout: data => {
        stdout += data.toString()
      },
      stderr(data) {
        stdout += data.toString()
      },
    },
    ...options,
  })

  return {
    exit,
    stdout,
    stderr,
  }
}

const main = async () => {
  const awsAccessKeyId = core.getInput('access-key-id', { required: true })
  const awsSecretAccessKey = core.getInput('secret-access-key', { required: true })
  const awsRegion = core.getInput('region', { required: true })
  const amplifyProjectName = core.getInput('project-name', { required: true })
  const amplifyAppId = core.getInput('app-id', { required: true })
  const amplifyEnvName = core.getInput('env-name', { required: true })

  const installAmplifyCommand = 'yarn global add @aws-amplify/cli'
  core.startGroup(installAmplifyCommand)
  await execAsync(installAmplifyCommand)
  core.endGroup()

  const yarnBin = (await execAsync('yarn global bin', undefined, { silent: true })).stdout.replace('\n', '')
  core.addPath(yarnBin)
  const envPath = (await execAsync('sh -c "echo $PATH"', undefined, { silent: true })).stdout.replace('\n', '')

  core.startGroup('amplify pull')

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
}

main().catch(e => {
  core.setFailed(e.message || JSON.stringify(e))
})
