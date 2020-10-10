ARG NODE_VERSION=14-alpine
FROM node:${NODE_VERSION}
COPY src ./src
COPY *.json ./
RUN npm rebuild
RUN npm install
COPY . .
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "stage"]
