FROM node:18-alpine as build

WORKDIR /src

COPY yarn.lock package.json /src/

RUN yarn install

COPY . /src/

RUN yarn build

FROM node:18-alpine as prod

COPY --from=build /src/dist /src/yarn.lock /src/package.json /dist/

WORKDIR /dist

RUN yarn --production=true

CMD node index.js