# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Copy the production proxy config before building
COPY proxy.prod.conf.json proxy.conf.json
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist/skyOxIhm/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]