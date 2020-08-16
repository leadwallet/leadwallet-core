pipeline {
 agent any
 environment {
  GIT_USERNAME = credentials("git-username")
  GIT_PASSWORD = credentials("git-password")
  CRYPTO_API_KEY = credentials("crypto-api-key")
  LEADWALLET_GIT_USERNAME = credentials("leadwallet-git-user")
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
   steps {
    sh("git push ssh://$LEADWALLET_GIT_USERNAME@heroku.com:leadwallet-core.git HEAD:master")
    echo "Pushed To Heroku."
   }
  }
 }
}