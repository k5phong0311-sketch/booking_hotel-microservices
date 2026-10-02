const fs = require('fs');

const backendDockerfile = `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main"]
`;

const services = ['api-gateway', 'booking-service', 'payment-service', 'room-service', 'user-service'];
services.forEach(svc => {
  fs.writeFileSync(`${svc}/Dockerfile`, backendDockerfile, 'utf8');
  console.log(`Created ${svc}/Dockerfile`);
});

const frontendDockerfile = `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Fix React Router Nginx 404 issue
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

fs.writeFileSync('frontend/Dockerfile', frontendDockerfile, 'utf8');
console.log('Created frontend/Dockerfile');
