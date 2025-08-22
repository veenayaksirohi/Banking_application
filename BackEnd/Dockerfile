# Step 1: Use an official Node.js image
FROM node:18

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of the project files
COPY . .

# Step 5: Generate Prisma client after code and dependencies are present

# Step 6: Expose necessary ports
EXPOSE 3000
EXPOSE 5432

# Step 7: Start the app
CMD ["npm", "run", "prod"]
