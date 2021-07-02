FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
RUN rm -f ~/.npmrc
COPY . .
EXPOSE 3001

CMD [ "npm", "run-script", "dev"]
