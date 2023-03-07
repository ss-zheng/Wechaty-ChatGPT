FROM node:19.7.0-bullseye-slim

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable
RUN apt-get update && apt-get install curl gnupg -y 
RUN curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt --fix-broken install
RUN apt-get install google-chrome-stable -y

WORKDIR /home/bot

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install
# RUN cd node_modules/whatsapp-web.js && npm install puppeteer@19.7.3 --save && cd /home/bot

# copy source code to the directory
COPY ["bot.ts", "./"]

CMD ["npm","run","start"]