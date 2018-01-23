FROM node:carbon

# Set a working directory
WORKDIR /usr/src/app

COPY ./package.json .
COPY ./yarn.lock .

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

# Run the container under "node" user by default
USER node

CMD [ "node", "server.js" ]
