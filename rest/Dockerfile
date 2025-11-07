# syntax=docker/dockerfile:1.7

# ---- Dependencies stage ----
FROM maven:3.9.9-eclipse-temurin-21-alpine AS deps
WORKDIR /app

COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -DfinalName=app -DskipTests clean package spring-boot:repackage
RUN java -Djarmode=layertools -jar target/*.jar extract --destination /layers

# ---- Dev stage (hot reload) ----
FROM maven:3.9.9-eclipse-temurin-21-alpine AS dev
WORKDIR /app

COPY pom.xml .
# Pre-download dependencies for dev mode
RUN mvn -q -DskipTests dependency:go-offline

# Install inotify-tools for file watching
RUN apk add --no-cache inotify-tools

# Copy the entrypoint script
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV SPRING_PROFILES_ACTIVE=dev
ENV SPRING_DEVTOOLS_RESTART_ENABLED=true
ENV SPRING_DEVTOOLS_LIVERELOAD_ENABLED=true

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]

# ---- Runtime (prod) stage ----
FROM eclipse-temurin:21-jre-alpine AS prod
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder /layers/dependencies/ ./
COPY --from=builder /layers/spring-boot-loader/ ./
COPY --from=builder /layers/snapshot-dependencies/ ./
COPY --from=builder /layers/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]


