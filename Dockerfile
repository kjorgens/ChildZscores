# Build:
# docker build -t meanjs/mean .
#
# Run:
# docker run -it meanjs/mean
#
# Compose:
# docker-compose up -d

FROM ubuntu:latest
MAINTAINER kjorgensen

# 80 = HTTP, 443 = HTTPS, 3000 = MEAN.JS server, 35729 = livereload, 8080 = node-inspector
EXPOSE 80 443 3000 35729 8080

# Set development environment as default
ENV NODE_ENV development

# Install Utilities
RUN apt-get update -q  \
 && apt-get install -yqq \
 curl \
 git \
 ssh \
 gcc \
 make \
 build-essential \
 libkrb5-dev \
 sudo \
 apt-utils \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#RUN sudo apt-get install yarn
# Install MEAN.JS Prerequisites
#RUN npm install --quiet -g gulp bower yo mocha karma-cli pm2 && npm cache clean

RUN mkdir -p /opt/kjorgens/public/lib
WORKDIR /opt/kjorgens

# Copies the local package.json file to the container
# and utilities docker container cache to not needing to rebuild
# and install node_modules/ everytime we build the docker, but only
# when the local package.json file changes.
# Install npm packages
COPY package.json /opt/kjorgens/package.json
RUN npm install --quiet && npm cache verify

# Install bower packages
COPY bower.json /opt/kjorgens/bower.json
COPY .bowerrc /opt/kjorgens/.bowerrc
#RUN bower install --quiet --allow-root --config.interactive=false

COPY . /opt/kjorgens

ENV COUCH_URL=database2.liahonakids.org:5984
ENV SYNC_ENTITY=mobilesync:d4JrQGVZV37c
ENV DOMAIN=localhost:3000
ENV S3_ACCESS_KEY_ID=AKIAJKRWQYXKV7OQYFRQ
ENV S3_SECRET_ACCESS_KEY=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
ENV S3_BUCKET=bountifulkids.profile.pics
ENV UPLOADS_STORAGE=s3

# Run MEAN.JS server
CMD npm install && npm start
