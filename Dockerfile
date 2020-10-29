ARG NODE_VERSION=14-alpine
FROM node:${NODE_VERSION}
COPY src ./src
COPY *.json ./
RUN rm -rf /node_modules
RUN npm cache clean --force
RUN npm install
COPY . .
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "prod"]
