FROM node:18-alpine

WORKDIR /app

COPY report-service/package*.json ./
COPY shared ./shared/

RUN npm install

COPY report-service/src ./src

EXPOSE 3006

CMD ["npm", "start"] 