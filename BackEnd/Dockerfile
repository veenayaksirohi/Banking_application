# Step 1: Use an official Node.js image
FROM node:18

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of the project
COPY . .

# Step 6: Expose port for Node.js app
EXPOSE 3000
EXPOSE 5432



# Step 7: Start the app
CMD ["npm", "run", "prod"]
