FROM node:20.18.0

WORKDIR /app

COPY package*.json ./
RUN npm install --no-optional

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 8187

CMD ["serve", "-s", "build", "-l", "8187"]
