FROM node:18
COPY ./Controllers/*.js ./Controllers/
COPY ./Models/*.js ./Models/
COPY ./Server.js ./
COPY ./Lib.js ./
COPY ./Resources/css/* ./Resources/css/
COPY ./Resources/img/* ./Resources/img/
COPY ./Resources/js/* ./Resources/js/
COPY ./Views/* ./Views/
COPY ./logs/* ./logs/
COPY ./package.json .
COPY ./config.conf .
RUN npm install --omit=dev
ENTRYPOINT npm start