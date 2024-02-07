FROM node:20-alpine

WORKDIR /usr/src/web_app

COPY package*.json .

COPY public .

COPY src .

RUN npm install

CMD ["npm", "start"]