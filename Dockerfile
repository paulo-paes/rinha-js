FROM node:18.18.0-alpine

WORKDIR /var/app

COPY *.js .

CMD node main.js /var/rinha/source.rinha.json