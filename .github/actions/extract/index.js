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
  const ref = core.getInput('ref', { required: true })
  console.log(ref)
  let amplifyEnv = ref
  if (ref.includes('master')){
    amplifyEnv = 'amplify-env'
  }

  core.setOutput('amplify-env', amplifyEnv)
}

main().catch(e => {
  core.setFailed(e.message || JSON.stringify(e))
})
