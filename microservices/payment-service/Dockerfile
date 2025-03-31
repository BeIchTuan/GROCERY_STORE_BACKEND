FROM node:18-alpine

WORKDIR /app

COPY payment-service/package*.json ./
COPY shared ./shared/

RUN npm install

COPY payment-service/src ./src

EXPOSE 3004

CMD ["npm", "start"] 