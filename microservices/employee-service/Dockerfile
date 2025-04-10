FROM node:18-alpine

WORKDIR /app

COPY employee-service/package*.json ./

RUN npm install

COPY employee-service/. .

EXPOSE 3009

CMD ["npm", "start"] 