[![version](https://img.shields.io/badge/version-0.2.0-yellow.svg)](https://semver.org)

# 🏗️ Scafoldr

**Scafoldr** is an AI-powered backend generator that builds boilerplate codebases for different programming languages and frameworks using your [DBML schema](https://dbml.dbdiagram.io/home/) and a few prompts.

Scafoldr generates a complete backend structure following modern Clean Architecture principles, including models, controllers, services, repositories, and all necessary configurations, helping you to jumpstart your development with minimal effort.

---

## 🚀 Features

- Generate Node Express JavaScript code based on your DBML schema, with postgress and sequlize-cli
- More options for generating code will come soon...
---

## ⚙️ Requirements

- Python 3.9+ (installed via [Homebrew](https://brew.sh/) recommended)
- [OpenAI API key](https://platform.openai.com/account/api-keys) if AI generation is used

---

## 🧪 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scafoldr.git
cd scafoldr
```

### 2. Create .env file

```bash
cp .env.example .env
```

Open the `.env` file and fill in the required values:

- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered generation.
- `OPENAI_API_MODEL`: default to gpt-4o-mini

Refer to the documentation or comments in `.env.example` for detailed explanations of each variable.

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


## Running the Frontend

To run the frontend, ensure that the Python API is running first. Follow the steps in the "Running api" section above to start the backend.

### Steps to run the frontend:

1. Navigate to the `web` directory:
  ```bash
  cd web
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Start the development server:
  ```bash
  npm run dev
  ```

4. Open your browser and visit http://localhost:3000 to access the frontend.

Make sure the backend API is running at http://localhost:8000, as the frontend relies on it for data and functionality.
