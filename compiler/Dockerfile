FROM node:24-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++ gcc python3 openjdk17-jdk
COPY . .
RUN npm install
EXPOSE 8000
CMD ["npm", "run", "dev"]