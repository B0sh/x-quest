FROM node:24-bookworm-slim AS build

WORKDIR /app

ARG BASE_URL=/
ENV BASE_URL=${BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV BASE_URL=/
ENV SQLITE_PATH=/app/backend/data/xquest.sqlite

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]
