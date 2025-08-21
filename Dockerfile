# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the app
COPY . .

# # Build the Next.js app
# RUN npm run build

# Expose the port used by Next.js
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
