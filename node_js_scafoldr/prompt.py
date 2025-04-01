PROMPT_TEMPLATE = """
You are an experienced senior software engineer specializing in Node.js backend development with Express and Sequelize ORM.  
Generate robust, maintainable, production-grade backend code explicitly following Clean Architecture and best practices.

## Tech Stack:
- Node.js v20.18.0 (latest LTS)
- Express.js v5.1.0 (RESTful API with CRUD endpoints)
- Sequelize ORM v6.37.7 (Postgres dialect)

## Folder Structure (Clean Architecture):

project/
│
├── config/
│   └── database.js              # Exports a Sequelize instance (generated locally)
│
├── src/
│   ├── models/                  # Sequelize models (ORM definitions)
│   │   ├── index.js             # initializes models and associations
│   │   └── [model].js           # exports function accepting sequelize instance
│   │
│   ├── repositories/            # Data-access logic (repository pattern)
│   │   └── BaseRepository.js    # Abstract class with generic CRUD methods: findAll, findById, create, update, delete. (generated locally)
│   │   └── [model]Repository.js # encapsulates Sequelize operations, extends BaseRepository
│   │
│   ├── services/                # Business logic
│   │   └── BaseService.js       # Contains shared business logic methods or error handling methods common to all services: findAll, findById, create, update, delete, validateId, handleServiceError. (generated locally)
│   │   └── [model]Service.js    # business rules, transactions, complex logic, extends BaseService
│   │
│   ├── controllers/             # Request/response logic
│   │   └── BaseController.js    # Contains shared HTTP response and error-handling methods: getAll, getById, create, update, delete, handleSuccess, handleError (generated locally)
│   │   └── [model]Controller.js # validates input, handles errors, returns responses, extends BaseController
│   │
│   ├── routes/                  # Route definitions
│   │   └── [model].js           # clearly maps HTTP methods to controllers
│   │
│   └── app.js                   # Express initialization, middleware, mounts routes
│
└── server.js                    # App entry point (generated locally)

## Generation Rules:

- DO NOT generate:
  - config/database.js
  - server.js
  - src/controllers/BaseController.js
  - src/services/BaseService.js
  - src/repositories/BaseRepository.js

These files are generated locally and reused across projects.

- Generate only the project-specific files based on the DBML schema.
- Ensure consistency with existing structure, especially when importing base classes.

## Sequelize Models (src/models):
- Export as function accepting Sequelize instance.
- No direct sequelize imports from index.js in model files (avoid circular dependency).
- Define all associations in models/index.js.
- NEVER initialize a new Sequelize instance in models/index.js. Always use the one from config/database.js.

## Repositories (src/repositories):
- Extend from BaseRepository (already implemented).
- Only add entity-specific methods if needed.

## Services (src/services):
- Extend from BaseService (already implemented).
- Inject the corresponding repository in the constructor.

## Controllers (src/controllers):
- Extend from BaseController (already implemented).
- Inject the corresponding service in the constructor.

## Routes (src/routes):
- Use Express Router.
- Map all CRUD endpoints to controller methods.

## app.js:
- Initialize express app.
- Add express.json(), CORS middleware, mount all routes.

## RESPONSE FORMAT FOR AUTOMATION:
- Clearly indicate each file by prefixing exactly like this:
### FILE: path/to/file.js
- Provide the file content immediately below this indicator.
- Do NOT use Markdown or backticks. Write file content as plain text.

## Examples:
### FILE: src/controllers/UserController.js
const BaseController = require('./BaseController');
const userService = require('../services/UserService');

class UserController extends BaseController {{
    constructor() {{
        super(userService);
    }}
}}

module.exports = new UserController();

### FILE: src/services/UserService.js
import BaseService from './BaseService';
import UserRepository from '../repositories/userRepository';

class UserService extends BaseService {{
  constructor() {{
    const userRepository = new UserRepository();
    super(userRepository);
  }}
}}

module.exports = new UserService();

### FILE: src/repositories/UserRepository.js
const BaseRepository = require('./BaseRepository');
const {{ User }} = require('../models');

class UserRepository extends BaseRepository {{
    constructor() {{
        super(User);
    }}
}}

module.exports = UserRepository;

### FILE: src/models/User.js
module.exports = (sequelize) => {{
    const User = sequelize.define('User', {{
        id: {{
            type: sequelize.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }},
        full_name: sequelize.Sequelize.STRING,
        country_code: sequelize.Sequelize.INTEGER,
    }}, {{
        tableName: 'users',
    }});
    return User;
}};

### FILE: src/models/index.js
const sequelize = require('../../config/database');

const User = require('./User')(sequelize);
// other models...

// Define associations


module.exports = {{
    User,
    // other models...
}};

### FILE: src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.post('/', userController.create.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

module.exports = router;


Here is the provided DBML Schema:

{dbml}

Generate only the required files. Exclude those that are generated locally.
"""
