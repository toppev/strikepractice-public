# Production Dockerfile
FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --only=production
RUN rm -f ~/.npmrc
COPY . .
EXPOSE 3030

CMD [ "npm", "start"]
