#Dockerfile for frontend application
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./index.html
COPY vite.config.js ./vite.config.js
COPY src ./src

RUN npm run build

# Production stage
FROM nginx:alpine

# Install available security fixes for Alpine packages
RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

