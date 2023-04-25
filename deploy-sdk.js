const { exec } = require('child_process')
const fs = require('fs')
const semver = require('semver')

async function buildWidgetsLib() {
  const currentVersion = await checkForNpmPackageVersion('@razzledotai/widgets')

  const packageJsonFilePath = './libs/widgets/package.json'

  // Update the version in the package.json
  const packageJson = require(packageJsonFilePath)
  console.log(packageJson)
  console.log(`Current version: ${currentVersion.trim()}`)

  const newVersion = semver.inc(currentVersion.trim(), 'patch')
  packageJson.version = newVersion

  console.log(`New version: ${newVersion}`)
  fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2))

  console.log('Building the widgets lib')

  const bashScript = `
    #!/bin/bash
    npx nx run widgets:build
    `
  // Run the bash script
  return new Promise((resolve, reject) => {
    exec(bashScript, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(newVersion)
      }
    })
  })
}

function deployWidgetsLib() {
  const bashScript = `
        #!/bin/bash
        cd dist/libs/widgets
        npm publish
        cd ../../..
        `
  // Run the bash script
  return new Promise((resolve, reject) => {
    exec(bashScript, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function buildSdk() {
  const bashScript = `
        #!/bin/bash      
        npx nx run razzle-sdk:build
        `

  // Run the bash script
  return new Promise((resolve, reject) => {
    exec(bashScript, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function deploySdk(widgetsLibVersion) {
  const currentVersion = await checkForNpmPackageVersion('@razzledotai/sdk')
  const packageJsonFilePath = './dist/libs/razzle-sdk/package.json'

  // Update the version in the package.json and update the version of the widgets lib in the dependencies

  const packageJson = require(packageJsonFilePath)
  console.log(packageJson)
  console.log(`Current sdk version: ${currentVersion.trim()}`)

  const newVersion = semver.inc(currentVersion.trim(), 'patch')
  packageJson.version = newVersion
  packageJson.dependencies['@razzledotai/widgets'] = widgetsLibVersion

  console.log(
    `New sdk version: ${newVersion} updated with widgets lib version: ${widgetsLibVersion}`
  )

  fs.writeFileSync(packageJsonFilePath, JSON.stringify(packageJson, null, 2))
  const bashScript = `
        #!/bin/bash
        cd dist/libs/razzle-sdk
        npm publish
        cd ../../..
        `
  // Run the bash script
  return new Promise((resolve, reject) => {
    exec(bashScript, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

function checkForNpmPackageVersion(packageName) {
  const bashScript = `
        #!/bin/bash
        # Check if the package exists
        npm view ${packageName} version
        `
  // Run the bash script and return the result
  return new Promise((resolve, reject) => {
    exec(bashScript, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

buildWidgetsLib()
  .then((newVersion) => {
    console.log('Deploying the widgets lib')
    deployWidgetsLib()
    return newVersion
  })
  .then(async (widgetsLibVersion) => {
    console.log(
      'Building the sdk using the new widgets lib version ' + widgetsLibVersion
    )

    await buildSdk()
    return widgetsLibVersion
  })
  .then((widgetsLibVersion) => deploySdk(widgetsLibVersion))
  .catch((err) => {
    console.error('Error building the widgets lib', err)
  })
