FROM node:18-alpine

WORKDIR /app

COPY provider-service/package*.json ./

RUN npm install

COPY provider-service . 

EXPOSE 3007

CMD ["npm", "start"] 