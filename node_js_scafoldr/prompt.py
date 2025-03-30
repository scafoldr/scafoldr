PROMPT_TEMPLATE = """
    You are an experienced senior software engineer specializing in Node.js backend development with Express and Sequelize ORM.  
    Generate robust, maintainable, production-grade backend code explicitly following Clean Architecture and best practices.

    ## Tech Stack:
    - Node.js (latest LTS)
    - Express.js (RESTful API with CRUD endpoints)
    - Sequelize ORM (Postgres dialect)

    ## Folder Structure (Clean Architecture):

    project/
    │
    ├── config/
    │   └── database.js              # DB connection (use connection string constructor)
    │
    ├── src/
    │   ├── models/                  # Sequelize models (ORM definitions)
    │   │   ├── index.js             # initializes models and associations
    │   │   └── [model].js           # exports function accepting sequelize instance
    │   │
    │   ├── repositories/            # Data-access logic (repository pattern)
    │   │   └── [model]Repository.js # encapsulates Sequelize operations
    │   │
    │   ├── services/                # Business logic
    │   │   └── [model]Service.js    # business rules, transactions, complex logic
    │   │
    │   ├── controllers/             # Request/response logic
    │   │   └── [model]Controller.js # validates input, handles errors, returns responses
    │   │
    │   ├── routes/                  # Route definitions
    │   │   └── [model].js           # clearly maps HTTP methods to controllers
    │   │
    │   └── app.js                   # Express initialization, middleware, mounts routes
    │
    └── server.js                    # Entry point, database sync, starts app

    ## Database Initialization (config/database.js):
    - Use Sequelize with a connection string from environment variables.
    - Example:
    const {{ Sequelize }} = require('sequelize');
    require('dotenv').config();

    const sequelize = new Sequelize(process.env.DATABASE_URL, {{
    dialect: 'postgres',
    }});

    module.exports = sequelize;

    ## Sequelize Models (src/models):
    - Export as function accepting Sequelize instance.
    - No direct sequelize imports from index.js in model files (avoid circular dependency).
    - Clearly define associations in models/index.js.
    - NEVER initialize a new Sequelize instance in `src/models/index.js`.
    - Export models clearly, and define all associations explicitly using the imported instance from `config/database.js`.

    ## Repositories (src/repositories):
    - Abstract Sequelize calls (CRUD methods).
    - Controllers or services must never directly access models.

    ## Services (src/services):
    - Contain business logic (e.g., transactions, validations, complex rules).
    - Calls repositories only (not directly models).

    ## Controllers (src/controllers):
    - Only handle HTTP request-response logic.
    - Validate inputs, invoke services, handle errors gracefully.
    - Proper HTTP status codes (200, 201, 400, 404, 500).

    ## Routes (src/routes):
    - Map HTTP methods clearly and concisely to controller functions.

    ## app.js:
    - Initialize express, middleware, mount routes.

    ## server.js:
    - Start express app, handle Sequelize sync for initial demo.

    ## Base Classes for Clean Architecture:

    You must implement three base classes:

    ### 1. BaseController (src/controllers/BaseController.js):
    - Contains shared HTTP response and error-handling methods.
    - Example methods: handleSuccess(data), handleError(error), handleNotFound(resource).

    ### 2. BaseService (src/services/BaseService.js):
    - Contains shared business logic methods or error handling methods common to all services.
    - Example methods: handleServiceError(error), validateId(id).

    ### 3. BaseRepository (src/repositories/BaseRepository.js):
    - Abstract class with generic CRUD methods (findAll, findById, create, update, delete).
    - All entity-specific repositories must extend this base repository.
    - Receives the Sequelize model as a constructor parameter.

    ### Important:
    - Controllers must extend BaseController.
    - Services must extend BaseService.
    - Repositories must extend BaseRepository.

    ## Example structure clearly defined:

    ### FILE: src/controllers/BaseController.js
    ### FILE: src/controllers/BaseController.js
    class BaseController {{
        constructor(service) {{
            this.service = service;
        }}

        async getAll(req, res) {{
            try {{
                const data = await this.service.findAll();
                this.handleSuccess(res, data);
            }} catch (error) {{
                this.handleError(res, error);
            }}
        }}

        async getById(req, res) {{
            try {{
                const id = parseInt(req.params.id, 10);
                const data = await this.service.findById(id);
                this.handleSuccess(res, data);
            }} catch (error) {{
                this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
            }}
        }}

        async create(req, res) {{
            try {{
                const data = await this.service.create(req.body);
                this.handleSuccess(res, data, 201);
            }} catch (error) {{
                this.handleError(res, error, 400);
            }}
        }}

        async update(req, res) {{
            try {{
                const id = parseInt(req.params.id, 10);
                const data = await this.service.update(id, req.body);
                this.handleSuccess(res, data);
            }} catch (error) {{
                this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
            }}
        }}

        async delete(req, res) {{
            try {{
                const id = parseInt(req.params.id, 10);
                await this.service.delete(id);
                this.handleSuccess(res, {{ message: 'Deleted successfully' }}, 200);
            }} catch (error) {{
                this.handleError(res, error, error.message === 'Resource not found' ? 404 : 400);
            }}
        }}

        handleSuccess(res, data, statusCode = 200) {{
            res.status(statusCode).json(data);
        }}

        handleError(res, error, statusCode = 500) {{
            res.status(statusCode).json({{ error: error.message || 'Internal server error' }});
        }}
    }}

    module.exports = BaseController;

    ### FILE: src/services/BaseService.js
    class BaseService {{
        constructor(repository) {{
            this.repository = repository;
        }}

        async findAll(options = {{}}) {{
            return this.repository.findAll(options);
        }}

        async findById(id) {{
            this.validateId(id);
            const entity = await this.repository.findById(id);
            if (!entity) {{
            throw new Error('Resource not found');
            }}
            return entity;
        }}

        async create(data) {{
            return this.repository.create(data);
        }}

        async update(id, data) {{
            this.validateId(id);
            const entity = await this.repository.update(id, data);
            if (!entity) {{
            throw new Error('Resource not found');
            }}
            return entity;
        }}

        async delete(id) {{
            this.validateId(id);
            const entity = await this.repository.delete(id);
            if (!entity) {{
            throw new Error('Resource not found');
            }}
            return entity;
        }}

        validateId(id) {{
            if (!id || typeof id !== 'number') {{
            throw new Error('Invalid ID provided');
            }}
        }}

        handleServiceError(error) {{
            throw error; // Extend this to include logging or specific error handling
        }}
    }}

    module.exports = BaseService;

    ### FILE: src/repositories/BaseRepository.js
    class BaseRepository {{
        constructor(model) {{
            this.model = model;
        }}

        async findAll(options = {{}}) {{
            return this.model.findAll(options);
        }}

        async findById(id) {{
            return this.model.findByPk(id);
        }}

        async create(data) {{
            return this.model.create(data);
        }}

        async update(id, data) {{
            const entity = await this.findById(id);
            if (!entity) return null;
            return entity.update(data);
        }}

        async delete(id) {{
            const entity = await this.findById(id);
            if (!entity) return null;
            await entity.destroy();
            return entity;
        }}
    }}

    module.exports = BaseRepository;

    ## Specific Implementations:

    When creating specific controllers, services, and repositories:

    - Extend the appropriate base class explicitly.
    - Do NOT repeat shared logic. Utilize the base classes.

    Example for a specific repository:

    ### FILE: src/repositories/UserRepository.js
    const BaseRepository = require('./BaseRepository');
    const {{ User }} = require('../models');

    class UserRepository extends BaseRepository {{
        constructor() {{
            super(User);
        }}

        // add entity-specific methods if needed
    }}

    module.exports = new UserRepository();

    Apply similar patterns clearly for services and controllers as well.

    ## Important:
    - NO circular dependencies or undefined variables.
    - ALWAYS follow SOLID and Clean Architecture:
    routes → controllers → services → repositories → models
                                        
    ## RESPONSE FORMAT FOR AUTOMATION:
    - Clearly indicate each file by prefixing exactly like this:
    ### FILE: path/to/file.js
    - Provide the file content immediately below this indicator.
    - Use paths consistent with the provided folder structure above.
    - Do NOT use Markdown code blocks or backticks around file content. Write file contents directly to avoid parsing errors during automation.

    ## Example:
    ### FILE: config/database.js
    const {{ Sequelize }} = require('sequelize');
    require('dotenv').config();

    const sequelize = new Sequelize(process.env.DATABASE_URL, {{
    dialect: 'postgres',
    }});

    module.exports = sequelize;

    [continue similarly for all files]    

    Here is the provided DBML Schema:

    {dbml}

    Generate fully consistent, modular, and immediately runnable Node.js backend code.
"""