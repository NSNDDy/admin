# Stage 1: Build the application
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run the application
FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/.nuxt ./.nuxt
COPY --from=build /app/static ./static
COPY --from=build /app/nuxt.config.js ./nuxt.config.js
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/plugins ./plugins
COPY --from=build /app/services ./services
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/store ./store
COPY --from=build /app/layouts ./layouts
COPY --from=build /app/pages ./pages

# Render sẽ tự động set biến môi trường PORT (ví dụ 10000).
# Nuxt.js sẽ ưu tiên sử dụng process.env.PORT nếu có cấu hình trong nuxt.config.js.
# Do đó ta không cần set cứng ENV NUXT_PORT ở đây để tránh xung đột.
ENV NUXT_HOST=0.0.0.0

EXPOSE 4000

CMD ["npm", "run", "start"]
