# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app listens on
EXPOSE 3000

# Command to run the application when the container starts
CMD ["npm", "run", "start"]