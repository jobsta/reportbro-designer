FROM node:20-alpine AS build

WORKDIR /usr/app

COPY package.json package.json
COPY package-lock.json package-lock.json

# ENV NODE_ENV=production

RUN npm install -g npm@10.8.2
RUN npm install --progress=false 

COPY . .

RUN npm run build-prod

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /usr/app/dist dist
COPY index.html .

CMD [ "nginx", "-g", "daemon off;" ]
