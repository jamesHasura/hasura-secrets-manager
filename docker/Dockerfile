FROM node
WORKDIR /usr/app
RUN npm init -y
RUN npm install axios 
RUN npm install node-schedule 
RUN npm install @kubernetes/client-node
RUN npm install dotenv
COPY ./refresh-credentials.js /usr/app/refresh-credentials.js
RUN chmod +x /usr/app/refresh-credentials.js
CMD [ "node", "refresh-credentials.js"]
EXPOSE 8080