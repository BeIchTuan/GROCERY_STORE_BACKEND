FROM node:18-alpine

WORKDIR /app

COPY customer-service/package*.json .

RUN npm install

COPY customer-service/ .

EXPOSE 3008

CMD ["npm", "start"] 