FROM node:18-alpine

WORKDIR /app

COPY purchase-order-service/package*.json ./
COPY shared ./shared/

RUN npm install

# Tạo thư mục uploads
RUN mkdir -p uploads

COPY purchase-order-service/src ./src

EXPOSE 3010

CMD ["npm", "start"] 