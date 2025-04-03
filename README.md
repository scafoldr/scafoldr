[![version](https://img.shields.io/badge/version-0.0.2-yellow.svg)](https://semver.org)

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
