FROM node:10.10.0

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install

EXPOSE 50051

