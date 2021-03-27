FROM ubuntu:14.04
RUN apt-key update
RUN apt-get update
RUN apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | sudo bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
RUN apt-get install -y git
RUN rm -rf node_modules
RUN rm -rf *.json
COPY src ./src
COPY *.json ./
RUN npm install -g node-gyp
RUN npm install
COPY . .
RUN npm run clean:build
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "prod"]
