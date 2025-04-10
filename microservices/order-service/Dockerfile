FROM node:18-alpine

WORKDIR /app

COPY order-service/package*.json .

RUN npm install

COPY order-service/ .

EXPOSE 3003

CMD ["npm", "start"] 