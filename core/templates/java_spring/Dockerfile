# ---- Build stage ----
# syntax=docker/dockerfile:1.7
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Prime dependency cache first for faster rebuilds
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

# Build the fat jar
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -DfinalName=app -DskipTests clean package spring-boot:repackage

# Extract Spring Boot layers
RUN java -Djarmode=layertools -jar target/*.jar extract --destination /layers

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /opt/app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Copy layers separately to maximize Docker cache reuse
COPY --from=builder /layers/dependencies/ ./
COPY --from=builder /layers/spring-boot-loader/ ./
COPY --from=builder /layers/snapshot-dependencies/ ./
COPY --from=builder /layers/application/ ./

# Run the application on port 8080
EXPOSE 8080
ENTRYPOINT ["java","org.springframework.boot.loader.launch.JarLauncher"]
