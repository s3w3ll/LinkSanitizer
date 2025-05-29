# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.






docker stop linksanitizer-app
docker rm linksanitizer


docker run -d \
  --name linksanitizer \
  -p 3000:3000 \
  --restart unless-stopped \
  linksanitizer:latest
