FROM node:22
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm install @angular/cli -g
EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0" ]