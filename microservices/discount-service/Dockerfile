FROM node:18-alpine

WORKDIR /app

COPY discount-service/package*.json ./
COPY shared ./shared/

RUN npm install

COPY discount-service/src ./src

EXPOSE 3005

CMD ["npm", "start"] 