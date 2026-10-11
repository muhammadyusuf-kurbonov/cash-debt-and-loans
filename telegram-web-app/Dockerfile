# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Yarn 4 (Modern) is pinned through .yarnrc.yml -> yarnPath, and the lockfile is
# in berry format, so the release and the lockfile must be in place before the
# install. Copying only package.json here used to resolve fresh versions on
# every build, which made the image non-reproducible.
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN yarn install --immutable

COPY . .
RUN yarn run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
