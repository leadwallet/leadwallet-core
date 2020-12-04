ARG NODE_VERSION=12-alpine
FROM node:${NODE_VERSION}
COPY src ./src
COPY *.json ./
RUN apt-get update && apt-get install -y git
RUN rm -rf /node_modules
RUN npm cache clean --force
RUN npm install -g node-gyp
RUN npm install
COPY . .
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "prod"]
