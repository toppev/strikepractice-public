# Production Dockerfile
FROM node:24-alpine as build
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies
COPY package*.json /app/
RUN npm ci

# Copy source and build
COPY . /app
RUN npm run build

FROM nginx:stable-alpine
# Copy build and nginx config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
