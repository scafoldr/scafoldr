# 🤝 Contributing to Scafoldr

First off, thanks for your interest in contributing! Scafoldr is an open-source tool built to help developers move faster from database design to working backend code — and we welcome contributions of all kinds.


## 🧑‍💻 Ways to Contribute

Whether you're a developer, designer, tester, or just passionate about the project, here are some great ways to contribute:

- 🐛 Report bugs
- 🌟 Suggest new features or improvements
- 🧩 Add new backend templates
- 💅 Improve UI/UX
- 🧪 Add or improve tests
- 📝 Improve documentation

## 💬 Communication
- Have a question or need help? [Open a Discussion](https://github.com/scafoldr/scafoldr/discussions)
- Found a bug? [Please open an issue](https://github.com/scafoldr/scafoldr/issues)
- Want to propose a big change? [Start a discussion first!](https://github.com/scafoldr/scafoldr/discussions)

## 💻 Setup Instructions

### Requirements

- [OpenAI API key](https://platform.openai.com/account/api-keys) if AI generation is used

- [Docker](https://www.docker.com/) (required for running the application using Docker)
or 
- Python 3.9+ (for running locally)

### 1. Clone the repository

```bash
git clone https://github.com/scafoldr/scafoldr.git
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

This command will start all the necessary services in detached mode. Once running, the app will be accessible at: http://127.0.0.1/

### or Start the application without Docker (optional)

If you prefer not to use Docker, you can start the application manually:

1. Run core as specified in [core/README.md](./core/README.md)

2. Run web as specified in [web/README.md](./web/README.md)

Ensure all required services (e.g., database) are running and properly configured before starting the application.

## 🐞 Debugging

### Redis Debugging

These commands help you inspect and troubleshoot Redis data storage when running Scafoldr with Docker.

```bash
# Connect to Redis CLI
docker exec -it redis redis-cli

# Common debugging commands
KEYS *                           # List all keys in the database
HGETALL project:default          # Get all hash fields for a specific key
HGET project:default example.txt # Get a specific hash field
HKEYS project:default            # Get all field names in a hash
TYPE key-name                    # Check the type of a key
```

## 🔀 Git Workflow

1. Fork the repository
2. Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3. Make your changes
4. Commit with a meaningful message:

    ```bash
    git commit -m "Add: feature or fix description"
    ```
5. Push to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
6. Open a Pull Request (PR) to the main branch


_*Thank you for being awesome! 🙌*_
