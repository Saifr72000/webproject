# Stage 1: Build TS
FROM node:20.18.0 AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .
RUN npm run build  # Assumes your script builds to /dist

# Stage 2: Run
FROM node:20.18.0

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --only=production

EXPOSE 2000
CMD ["node", "dist/index.js"]
