# Stage: base image
ARG BUILD_NUMBER
ARG GIT_REF

FROM node:14.17.3-buster-slim as base

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
        adduser --uid 2000 --system appuser --gid 2000

WORKDIR /app

RUN apt-get update && \
        apt-get upgrade -y

# Stage: build assets
FROM base as build
ARG BUILD_NUMBER
ARG GIT_REF

RUN apt-get install -y make python g++

COPY package*.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit

COPY . .
RUN npm run build

ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
ENV GIT_REF ${GIT_REF:-dummy}
RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
        export GIT_REF=${GIT_REF} && \
        npm run record-build-info

# Stage: copy production assets and dependencies
FROM base

RUN apt-get install -y make python g++ && \
        apt-get autoremove -y && \
        rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --no-audit --production

COPY --from=build --chown=appuser:appgroup \
        /app/build-info.json ./dist/build-info.json

COPY --from=build --chown=appuser:appgroup \
        /app/assets ./assets

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

ARG BUILD_NUMBER
ENV SENTRY_RELEASE ${BUILD_NUMBER:-1_0_0}

EXPOSE 3000
ENV NODE_ENV='production'
USER 2000

CMD [ "npm", "start" ]
