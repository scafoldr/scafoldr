README_TEMPLATE = """ \
# {project_name}

Generated with Scafoldr.

## Getting Started

- Install dependencies: `npm install`
- Start the server: `npm run start`
- Access the server at `http://localhost:{port}`
"""

DOT_ENV_TEMPLATE = """ \
DATABASE_URL={DATABASE_URL}
PORT={port}
"""

GIT_IGNORE_TEMPLATE = """ \ 
node_modules
.env
"""
