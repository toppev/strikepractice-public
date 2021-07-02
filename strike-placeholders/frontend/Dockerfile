# Production Dockerfile
FROM node:12-alpine as build
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# Install (and cache) dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn

COPY . /app
RUN yarn build

FROM nginx:stable-alpine
# Copy build and nginx config
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
