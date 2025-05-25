

[![Visit Scafoldr](https://img.shields.io/static/v1?label=Website&message=Scafoldr&color=blue)](https://scafoldr.com) 
![version](https://img.shields.io/badge/version-1.0.0-green.svg)

<p align="center" style="font-size: 100px">
    🏗️
<p>


# 🛠️ Scafoldr

Scafoldr is an open-source developer tool that helps you quickly build and prototype backend applications by generating code from database schema definitions. Whether you're starting with [DBML code](https://dbml.dbdiagram.io/home) or brainstorming your database with AI, Scafoldr lets you go from **idea to backend** in seconds.


## ✨ Features

### 1. 🔄 [Code Generator](https://scafoldr.com/code-generator)
Paste your [DBML](https://www.dbml.org/) code and instantly generate clean, structured backend code for your project.

- Supports multiple backend stacks (Node.js, Java, Python – with more to come)
- Clean architecture templates
- Download or preview generated files

### 2. 🧠 [Chat with Architect AI](https://scafoldr.com/)
Not sure how to structure your database? Just describe your use case and let our AI architect help you draft your DBML schema.

- Interactive AI chat to design your database
- Visual DBML preview (diagram or code)
- Easily convert AI-generated DBML into backend code


## 🚀 Getting Started

1. Go to https://scafoldr.com/code-generator  
2. **Paste your DBML** or use our example to get started
3. Click `Generate Code`
4. Fill in your project name and pick your backend
5. Download or preview your generated project

Or...

1. Go to https://scafoldr.com
2. **Chat with the AI Architect**
3. Describe your app or idea
4. Receive DBML and tweak it if needed
5. Convert it into backend code in one click


## 🧩 Tech Stack

- Frontend: Next.js, TailwindCSS
- Backend: Python, FastAPI, Jinja2 for templating
- AI: OpenAI GPT models
- Parsing: [DBML Parser by Holistics](https://github.com/holistics/dbml) and [PyDBML by Vanderhoof](https://github.com/Vanderhoof/PyDBML)

## 🤝 Contributing

We’re looking for contributors! 🚀  
Whether you want to add a new backend template, improve the UI/UX, or help with DBML parsing logic—your help is welcome.

### How to Contribute

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Join us in shaping the future of backend automation. Contributions of all kinds are welcome – code, docs, templates, ideas!

## 📣 Contact & Community

If you like what we're building, feel free to:

- ⭐ Star this repo
- 📢 Share it with your team or dev community
- 🗣️ Join the discussion via issues or pull requests

## 🧪 Example Projects

Coming soon! We'll share a few examples of backend projects built with Scafoldr.



## ⚙️ Requirements

- [OpenAI API key](https://platform.openai.com/account/api-keys) if AI generation is used

- [Docker](https://www.docker.com/) (required for running the application using Docker)
or 
- Python 3.9+ (for running locally)


## 🚀 Getting Started

1. **Paste your DBML** or use our example to get started
2. Click `Generate Code`
3. Fill in your project name and pick your backend
4. Download or preview your generated project

Or...

1. **Chat with the AI Architect**
2. Describe your app or idea
3. Receive DBML and tweak it if needed
4. Convert it into backend code in one click

---



---

## 💻 How to Run Locally

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
