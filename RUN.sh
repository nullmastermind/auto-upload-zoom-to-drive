#!/bin/bash

git pull

# Install dependencies
yarn install

# Build the app
yarn build

# Start the app
yarn start