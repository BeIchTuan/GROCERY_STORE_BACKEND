FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Tạo thư mục uploads
RUN mkdir -p uploads

COPY . .

EXPOSE 3010

CMD ["npm", "start"] 