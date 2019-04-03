FROM node:10.10.0

RUN mkdir /app
COPY package.json /app
COPY package-lock.json /app
WORKDIR /app
RUN npm install
COPY . /app

EXPOSE 50051

