FROM node:latest
WORKDIR /usr/src/app
COPY ./WebContent/package*.json ./
RUN npm install
COPY ./WebContent .
EXPOSE 3001
CMD ["npm", "start"]
