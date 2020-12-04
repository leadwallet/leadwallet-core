# ARG NODE_VERSION=12-alpine
# FROM node:${NODE_VERSION}
# COPY src ./src
# COPY *.json ./
# RUN git -v
# RUN rm -rf /node_modules
# RUN npm cache clean --force
# RUN npm install -g node-gyp
# RUN npm install
# COPY . .
# EXPOSE $PORT
# ENTRYPOINT ["npm", "run", "prod"]
FROM ubuntu:latest
RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install nodejs
RUN apt-get -y install npm
COPY src ./src
COPY *.json ./
RUN git -v
RUN rm -rf /node_modules
RUN npm cache clean --force
RUN npm install -g node-gyp
RUN npm install
COPY . .
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "prod"]
