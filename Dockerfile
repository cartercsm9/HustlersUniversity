# Use the official Node.js image as a base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose ports for Node.js and MySQL
EXPOSE 3001 3306

# Command to run the application
CMD ["bash", "-c", "service mysql start && node server.js"]
