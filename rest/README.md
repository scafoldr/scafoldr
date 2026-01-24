# Scafoldr REST API

REST API backend for the Scafoldr application, providing secure communication with the Scafoldr database and handling user authentication, project management, and code generation workflows.

## Architecture

The REST API is built using **Spring Boot 3.5.6** with **Java 21** and follows a layered architecture with clear separation between domain and application layers:

### Domain Layer (Generic Components)

The domain layer provides generic, reusable components that form the foundation for all entities:

- **[`DomainModel`](src/main/java/com/scafoldr/model/DomainModel.java)** - Abstract base entity with common fields (ID, serialization)
- **[`DomainController`](src/main/java/com/scafoldr/controller/DomainController.java)** - Generic REST controller providing CRUD operations for any domain entity
- **[`DomainService`](src/main/java/com/scafoldr/service/DomainService.java)** - Generic service layer with common business logic (validation, transactions)
- **[`DomainDTO`](src/main/java/com/scafoldr/dto/DomainDTO.java)** - Marker interface for data transfer objects
- **[`BaseRepository`](src/main/java/com/scafoldr/repository/BaseRepository.java)** - Generic JPA repository interface extending Spring Data JPA

### Domain Layer (Entity-Specific Components)

Components that extend the generic domain abstractions to provide CRUD operations for specific entities:

- **Entity Services** - Services extending [`DomainService`](src/main/java/com/scafoldr/service/DomainService.java) ([`UserService`](src/main/java/com/scafoldr/service/UserService.java))
- **Entity Controllers** - Controllers extending [`DomainController`](src/main/java/com/scafoldr/controller/DomainController.java) for specific entities
- **Entity Repositories** - Repositories extending [`BaseRepository`](src/main/java/com/scafoldr/repository/BaseRepository.java) ([`UserRepository`](src/main/java/com/scafoldr/repository/UserRepository.java))
- **Entity Models** - JPA entities extending [`DomainModel`](src/main/java/com/scafoldr/model/DomainModel.java) ([`User`](src/main/java/com/scafoldr/model/User.java), [`Project`](src/main/java/com/scafoldr/model/Project.java))
- **Entity DTOs** - Request/response objects implementing [`DomainDTO`](src/main/java/com/scafoldr/dto/DomainDTO.java)

### Application Layer (Business Logic Components)

Components that implement application-specific business logic without extending domain abstractions:

- **Business Services** - Services with complex business logic ([`AuthService`](src/main/java/com/scafoldr/service/AuthService.java), [`EmailService`](src/main/java/com/scafoldr/service/EmailService.java))
- **Application Controllers** - Controllers with custom endpoints ([`AuthController`](src/main/java/com/scafoldr/controller/AuthController.java))
- **Utility Components** - JWT handling, security configuration, exception handlers

### Architecture Benefits

- **Code Reusability** - Generic CRUD operations reduce boilerplate
- **Consistency** - Standardized patterns across all entities
- **Maintainability** - Changes to common functionality affect all entities
- **Type Safety** - Generic types ensure compile-time validation
- **Extensibility** - Easy to add new entities by extending domain components

### Key Features

- **JWT Authentication** - Secure token-based authentication
- **Email Verification** - User registration with email verification codes
- **Project Management** - Multi-user project collaboration
- **Database Migrations** - Liquibase for schema versioning
- **Security** - Spring Security with rate limiting and validation

### Database

- **PostgreSQL** - Primary database
- **Liquibase** - Database migration management

## Database Migrations

This module uses **Liquibase 4.25.1** for database schema management and migrations.

### Migration Structure

Migrations are organized in [`src/main/resources/db/changelog/`](src/main/resources/db/changelog/):

```
db/changelog/
├── db.changelog-master.yaml    # Master changelog file
├── 001-create-tables.yaml      # Initial tables (users, verification_codes)
└── 002-create-project-table.yaml # Project and user_project tables
```

The master changelog ([`db.changelog-master.yaml`](src/main/resources/db/changelog/db.changelog-master.yaml)) includes all migration files in order.

### Adding New Migrations

1. **Create a new changelog file** with sequential numbering:
   ```bash
   touch src/main/resources/db/changelog/003-your-migration-name.yaml
   ```

2. **Add the migration content** following Liquibase YAML format:
   ```yaml
   databaseChangeLog:
     - changeSet:
         id: unique-id-timestamp
         author: your-name
         changes:
           - createTable:
               tableName: your_table
               columns:
                 - column:
                     name: id
                     type: BIGINT
                     autoIncrement: true
                     constraints:
                       primaryKey: true
   ```

3. **Include in master changelog** by adding to [`db.changelog-master.yaml`](src/main/resources/db/changelog/db.changelog-master.yaml):
   ```yaml
   databaseChangeLog:
     - include:
         file: db/changelog/003-your-migration-name.yaml
   ```

### Migration Execution

Migrations run automatically on application startup when [`spring.liquibase.enabled=true`](src/main/resources/application.properties:16) is set.

## Useful Commands

### Local Development

**Run the application:**
```bash
./mvnw spring-boot:run
```

**Generate migration from model changes:**
```bash
./mvnw liquibase:diff
```

**Apply pending migrations:**
```bash
./mvnw liquibase:update
```

**Rollback last migration:**
```bash
./mvnw liquibase:rollback -Dliquibase.rollbackCount=1
```

**View migration status:**
```bash
./mvnw liquibase:status
```

**Validate migrations:**
```bash
./mvnw liquibase:validate
```

### Docker Environment

When running with Docker, execute commands inside the container:

**Access the container:**
```bash
docker exec -it scafoldr-rest-1 bash
```

**Run Liquibase commands in container:**
```bash
# Generate diff migration
docker exec -it rest mvn liquibase:diff

# Apply migrations
docker exec -it rest mvn liquibase:update

# Check status
docker exec -it rest mvn liquibase:status

# Rollback
docker exec -it rest mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

**Direct database access in Docker:**
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d scafoldr

# View migration history
docker exec -it postgres psql -U postgres -d scafoldr -c "SELECT * FROM databasechangelog ORDER BY dateexecuted DESC LIMIT 10;"
```

### Configuration

**Environment Variables:**
- `POSTGRES_HOST` - Database host
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `EMAIL_SENDER_USERNAME` - SMTP username
- `EMAIL_SENDER_PASSWORD` - SMTP password

**Liquibase Configuration:**
Copy [`liquibase.properties.example`](src/main/resources/liquibase.properties.example) to `liquibase.properties` and update with your database credentials for local development.

### Build and Test

**Build the application:**
```bash
./mvnw clean package
```

**Run tests:**
```bash
./mvnw test
```

**Build Docker image:**
```bash
docker build -t rest .