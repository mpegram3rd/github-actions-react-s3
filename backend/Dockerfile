FROM --platform=linux/amd64 amazoncorretto:22-alpine
VOLUME /tmp
COPY build/libs/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]