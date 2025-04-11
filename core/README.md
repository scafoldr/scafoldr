## Running core locally

This section describes how to set up and run the core module of the app — the backend logic responsible for parsing DBML files and generating full-stack code projects using different backend templates.

For high-level project structure and usage, refer to the [root README](../README.md).

### 1. Create .env file

```bash
cp .env.example .env
```

Open the `.env` file and fill in the required values. Refer to the documentation or comments in `.env.example` for detailed explanations of each variable.

### 2. Navigate to the `core` directory:
  ```bash
  cd core
  ```

### 3. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the app from source
```bash
PYTHONPATH=src python3 src/cli/main.py generate
```

🧰 Optional: Install as a real CLI command

```bash
pip install -e .
```
Now you can just run:

```bash
scafoldr
```

### 6. Using scafoldr

1. Create your `input/*.dbml` file with your specific DBML schema.

2. Run the following command and follow further instructions in console:
    ```bash
    PYTHONPATH=src python3 src/cli/main.py generate
    ```
    or just:
    ```base
    scafoldr
    ```
3. Open output/* folder and inside you will see all your Scafoldr projects


## Running api

Run:
```bash
uvicorn src.api.main:app --reload
```

Visit http://localhost:8000/docs to see available methods and try them out. 

### Generate POST request: 

URL: http://localhost:8000/generate

Request body:
```json
{
  "project_name": "my-api-test-app",
  "database_name": "my_api_test_app_db",
  "backend_option": "nodejs-express-js",
  "features": [],
  "user_input": "// Use DBML to define your database structure\n// Docs: https://dbml.dbdiagram.io/docs\n\nTable follows {\n  following_user_id integer\n  followed_user_id integer\n  created_at timestamp \n}\n\nTable users {\n  id integer [primary key]\n  username varchar\n  role varchar\n  created_at timestamp\n}\n\nTable posts {\n  id integer [primary key]\n  title varchar\n  body text [note: 'Content of the post']\n  user_id integer [not null]\n  status varchar\n  created_at timestamp\n}\n\nRef user_posts: posts.user_id > users.id // many-to-one\n\nRef: users.id < follows.following_user_id\n\nRef: users.id < follows.followed_user_id"
}
```
