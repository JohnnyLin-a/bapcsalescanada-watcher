FROM node:18-alpine as build

WORKDIR /src

COPY yarn.lock package.json /src/

RUN yarn install

COPY index.ts /src/

RUN yarn build

FROM node:18-alpine as prod

RUN mkdir -p /dist

WORKDIR /dist

COPY yarn.lock package.json /dist/

RUN yarn --production=true

COPY --from=build /src/dist /dist/

CMD node index.js