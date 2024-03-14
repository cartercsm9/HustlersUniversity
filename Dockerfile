FROM node:latest
WORKDIR /usr/src/app
COPY ./WebContent/package*.json ./
RUN npm install
RUN npm install mysql2@latest ejs body-parser express node-fetch dotenv bcryptjs
COPY ./WebContent .
EXPOSE 3001
CMD ["npm", "start"]
