FROM --platform=linux/amd64 amazoncorretto:22-alpine
## Use below for local testing on Apple Silicon
# FROM --platform=linux/arm64/v8 amazoncorretto:22-alpine

VOLUME /tmp
COPY build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

## Expose endpoint on port 80
EXPOSE 80
ENTRYPOINT ["java","-jar","/app.jar", "--server.port=80"]