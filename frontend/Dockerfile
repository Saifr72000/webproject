FROM node:20.18.0 

WORKDIR /app

COPY package*.json ./
RUN npm install --no-optional

COPY . .

EXPOSE 8187

RUN npm install-g serve

CMD npm run build && serve -s dist -l 8187