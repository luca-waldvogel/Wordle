FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY . .

CMD sh -c 'echo "window.API_BASE_URL = \"${API_BASE_URL}\";" > config.js && nginx -g "daemon off;"'

EXPOSE 80