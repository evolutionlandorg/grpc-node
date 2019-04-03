FROM node:10.10.0

RUN mkdir /app
COPY package.json /app
COPY yarn.lock /app
WORKDIR /app
RUN npm install
COPY . /app

EXPOSE 50051

