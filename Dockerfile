ARG NODE_VERSION=10-alpine
FROM node:${NODE_VERSION}
COPY src ./
COPY *.json ./
RUN npm install
COPY . .
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "prod"]
