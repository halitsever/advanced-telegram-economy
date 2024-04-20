FROM --platform=linux/amd64 node:18-alpine3.15

WORKDIR /app

COPY --chown=node:node . /app

COPY --chown=node:node package.json .

COPY --chown=node:node package-lock.json .

RUN npm install

USER node

CMD ["npm", "run", "start"]