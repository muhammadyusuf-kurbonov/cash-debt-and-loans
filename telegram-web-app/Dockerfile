# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . .
RUN yarn run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
