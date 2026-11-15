FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/astra-backend-0.1.0-SNAPSHOT.jar app.jar
RUN mkdir -p /app/data && chown 10001:10001 /app/data
ENV BACKEND_ADDRESS=0.0.0.0
EXPOSE 8080
USER 10001:10001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
