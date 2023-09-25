FROM node:18.18.0-alpine

WORKDIR /var/app

COPY . .

CMD node main.js