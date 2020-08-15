pipeline {
 agent any
 environment {
  GIT_USERNAME = credentials("git-username")
  GIT_PASSWORD = credentials("git-password")
  CRYPTO_API_KEY = credentials("crypto-api-key")
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
  stage("Push To Heroku") {
   sh("git push $GIT_USERNAME:$GIT_PASSWORD@git.heroku.com/leadwallet-core.git HEAD:master")
   echo "Pushed To Heroku."
  }
 }
}