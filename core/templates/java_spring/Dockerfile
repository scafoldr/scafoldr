FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

# Install Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy project structure
COPY src ./src

EXPOSE 8080

# Use spring-boot:run directly (DevTools will restart on classpath changes)
CMD ["mvn", "spring-boot:run"]