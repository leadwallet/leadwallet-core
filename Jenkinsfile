pipeline {
 agent any
 environment {
  GIT_USERNAME = credentials("git-username")
  GIT_PASSWORD = credentials("git-password")
  CRYPTO_API_KEY = credentials("crypto-api-key")
  // LEADWALLET_GIT_USERNAME = credentials("leadwallet-git-user")
 }
 stages {
  stage("Install Dependencies") {
   steps {
    sh("sudo npm install")
    echo "Dependencies installed."
   }
  }
  stage("Generate Environment Variable File From .env.jenkins") {
   steps {
    sh "cp .env.jenkins .env"
   }
  }
  stage("Run Tests") {
   steps {
    sh "npm run clean:build:test"
    echo "Tests completed."
   }
  }
  stage("Create Build Detail Files & SCM Tag") {
   steps {
    sh('echo "Build Number: $BUILD_NUMBER \n Status: passed \n Job: $JOB_NAME \n Node: $NODE_NAME \n Workspace: $WORKSPACE" > build-$JOB_NAME-$BUILD_NUMBER.txt')
    sh "cp build-${JOB_NAME}-${BUILD_NUMBER}.txt /jenkins/build-$JOB_NAME-$BUILD_NUMBER.txt"
    sh 'git tag -a leadwallet-core-$BUILD_ID-$NODE_NAME "Jenkins Pipeline Build."'
    sh 'git add . && git commit -m "Jenkins pipeline build succeeded"'
   }
  }
  stage("Push To GitHub") {
   steps {
    sh("git push https://$GIT_USERNAME:$GIT_PASSWORD@github.com/leadwallet/leadwallet-core HEAD:leadwallet-core-jenkins-pipelines")
    echo "Pushed To Github."
   }
  }
 }
}