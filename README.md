[![version](https://img.shields.io/badge/version-0.3.0-yellow.svg)](https://semver.org)

# 🏗️ Scafoldr

**Scafoldr** is an AI-powered backend generator that builds boilerplate codebases for different programming languages and frameworks using your [DBML schema](https://dbml.dbdiagram.io/home/) and a few prompts.

Scafoldr generates a complete backend structure following modern Clean Architecture principles, including models, controllers, services, repositories, and all necessary configurations, helping you to jumpstart your development with minimal effort.

---

## 🚀 Features

- Generate Node Express JavaScript code based on your DBML schema, with postgress and sequlize-cli
- More options for generating code will come soon...
---

## ⚙️ Requirements

- [OpenAI API key](https://platform.openai.com/account/api-keys) if AI generation is used

- [Docker](https://www.docker.com/) (required for running the application using Docker)
or 
- Python 3.9+ (for running locally)


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

Open the `.env` file and fill in the required values. Refer to the documentation or comments in `.env.example` for detailed explanations of each variable.

### 3. Start the application using Docker (recommended)

```bash
docker-compose up -d
```

This command will start all the necessary services in detached mode. Make sure Docker is installed and running on your system.

### 4. Start the application without Docker (optional)

If you prefer not to use Docker, you can start the application manually:

1. Run core as specified in [core/README.md](./core/README.md)

2. Run web as specified in [web/README.md](./web/README.md)

Ensure all required services (e.g., database) are running and properly configured before starting the application.
