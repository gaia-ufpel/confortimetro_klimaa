FROM node:20-alpine

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

CMD ["node", "index.js"]

