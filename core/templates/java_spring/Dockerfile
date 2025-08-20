# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Prime dependency cache first for faster rebuilds
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline

# Build the fat jar
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -DfinalName=app -DskipTests clean package spring-boot:repackage

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /opt/app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

# Copy the jar out from builder
COPY --from=builder /app/target/app.jar ./app.jar

EXPOSE 8080
ENTRYPOINT [ "java", "-jar", "/app.jar" ]
