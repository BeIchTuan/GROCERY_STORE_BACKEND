FROM node:18-alpine

WORKDIR /app

COPY product-service/package*.json ./
COPY shared ./shared/

RUN npm install

COPY product-service/src ./src

EXPOSE 3002

CMD ["npm", "start"] 