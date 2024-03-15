FROM node:latest
WORKDIR /usr/src/app
COPY ./WebContent/package*.json ./
RUN npm install
RUN npm install chai mocha --save-dev
RUN npm install mysql2@latest
RUN npm install ejs
RUN npm install body-parser
RUN npm install express node-fetch
RUN npm install dotenv
RUN npm install bcryptjs
COPY ./WebContent .
EXPOSE 3001
CMD ["npm", "test"]
