# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /

# Copy the package.json and package-lock.json files to the container

COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Expose the port your app runs on (default for Metro Bundler is 8081)
EXPOSE 8080

# Start the React Native development server
CMD ["npm", "start"]
