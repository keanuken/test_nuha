FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
# Install semua deps (termasuk dev) untuk prisma CLI + dotenv
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY public ./public

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "src/server.js"]
