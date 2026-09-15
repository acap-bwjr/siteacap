FROM node:20-alpine

WORKDIR /app

COPY . .

ENV PORT=80
EXPOSE 80

CMD ["node", "scripts/static-server.js"]
