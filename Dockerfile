FROM node:9.3-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
VOLUME /data
EXPOSE 3000
CMD [ "npm", "start" ]
