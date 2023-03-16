FROM node
WORKDIR /usr/app
RUN npm init -y
RUN npm install axios 
RUN npm install @kubernetes/client-node
RUN npm install dotenv
RUN npm install chokidar
RUN npm install js-yaml
COPY ./refresh-credentials.js /usr/app/refresh-credentials.js
RUN chmod +x /usr/app/refresh-credentials.js
CMD [ "npm", "start"]
EXPOSE 8080