# Use the official Meteor base image
FROM geoffreybooth/meteor-base:2.13.3 AS builder

# Set environment variables
ENV APP_NAME=uc-blaze
ENV METEOR_DISABLE_OPTIMISTIC_CACHING=1
# Set a working directory
RUN mkdir -p /app/${APP_NAME}
WORKDIR /app/${APP_NAME}

# Copy only the package.json and package-lock.json files for dependency installation
COPY package*.json ./

# Install project dependencies
RUN meteor npm install
RUN meteor npm install --save @babel/runtime bootstrap

# Copy the rest of the project files to the working directory
COPY . .

# Build the Meteor app
RUN meteor build --directory /app/${APP_NAME}

# Use a new base image for the final image
FROM node:14.21.3

# Set environment variables
ENV APP_NAME=uc-blaze
ENV METEOR_DEBUG_BUILD=1
ENV METEOR_PROFILE=1
ENV METEOR_DISABLE_OPTIMISTIC_CACHING=1

# Set the working directory
WORKDIR /app/${APP_NAME}

# Copy the bundled Meteor app from the builder image
COPY --from=builder /app/${APP_NAME}/bundle .
WORKDIR /app/${APP_NAME}/programs/server
COPY --from=builder /app/${APP_NAME}/settings.json .
WORKDIR /app/${APP_NAME}

# Install ps command
RUN apt-get update && apt-get install procps

RUN curl https://install.meteor.com/ | sh

# Install production dependencies
RUN cd programs/server && npm install --production && npm uninstall fibers && npm install fibers && npm rebuild && npm install --save @mapbox/node-pre-gyp

# Set environment variables
ENV ROOT_URL=http://localhost:3000
ENV MONGO_URL=mongodb://localhost:27017/uc-blaze
ENV LOGIN_BASE_URL=http://dev.vertisoft.com:30300/api/rest/v1/
ENV VERSION_ID=240909.0
ENV PORT=3000

# Expose the default Meteor port
EXPOSE 3000

# Start the Meteor app
CMD ["node", "main.js"]

