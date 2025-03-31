[![version](https://img.shields.io/badge/version-0.0.1-yellow.svg)](https://semver.org)

# scafoldr


Scafoldr is an automated project scaffolding tool designed to quickly transform your [DBML schema](https://dbml.dbdiagram.io/home/) definitions into fully functional Node.js backend projects. Leveraging the power of AI, Scafoldr generates a complete backend structure following modern Clean Architecture principles, including models, controllers, services, repositories, and all necessary configurations, helping you to jumpstart your development with minimal effort.

## Features

- Automatically generates backend structures from DBML schema.

- Follows Clean Architecture and best practices.

- Provides ready-to-use, production-grade code.

- Highly customizable and extendable.


## Instructions for Running the Tool

1. Install the required dependencies:
    ```bash
    pip3 install -r requirements.txt
    ```
2. Create `.env` file and fill it with variables and values from `.env.example` (OPENAI_API_KEY required here)

2. Create your `input/*.dbml` file with your specific DBML schema.

3. Run the following command and follow further instructions in console:
    ```bash
    python3 node_js_scafoldr/index.py
    ```
3. Open output/* folder and inside you will see all your Scafoldr projects
