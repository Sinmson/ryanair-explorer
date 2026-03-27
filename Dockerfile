# Expects a production build at dist/ryanair-explorer/browser (run ng build first).
# CI downloads that folder as an artifact before docker build — no second Node/npm build here.
FROM nginx:alpine
COPY dist/ryanair-explorer/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
