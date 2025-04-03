import os
import openai
from dotenv import load_dotenv
import subprocess
from langchain_openai import ChatOpenAI
from prompt import PROMPT_TEMPLATE
from initial_files_templates import README_TEMPLATE, DOT_ENV_TEMPLATE, GIT_IGNORE_TEMPLATE
import json
import shutil

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

# Your enhanced prompt
def call_openai(dbml_schema):
    prompt = PROMPT_TEMPLATE.format(dbml=dbml_schema)
    
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke(prompt)

    return response.content

def parse_and_create_files(ai_response, project_name):
    project_dir = './output/' + project_name
    sections = ai_response.split("### FILE:")[1:]

    for section in sections:
        lines = section.strip().splitlines()
        filepath = lines[0].strip()
        file_content = '\n'.join(lines[1:]).strip()

        # Create directories if not exist
        full_path = os.path.join(project_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        # Write file content
        with open(full_path, 'w') as f:
            f.write(file_content)

        print(f"✅ Created file: {full_path}")

def setup_initial_files(project_name, port=3000, db_user='user', db_password='password', db_port=5432, db_host='localhost'):
    db_name = project_name.replace('-', '_') + '_db'
    project_dir = './output/' + project_name
    os.makedirs(project_dir, exist_ok=True)

    # Add .gitignore
    with open(os.path.join(project_dir, '.gitignore'), 'w') as f:
        f.write(GIT_IGNORE_TEMPLATE.format())

    # Add README.md
    with open(os.path.join(project_dir, 'README.md'), 'w') as f:
        f.write(README_TEMPLATE.format(project_name=project_name, port=port))
    
    # Add .env
    with open(os.path.join(project_dir, '.env'), 'w') as f:
        f.write(DOT_ENV_TEMPLATE.format(DATABASE_URL=f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}', port=port))

    print(f"✅ Initial files (.gitignore, README.md, .env) added.")

    # Copy everything from ./template to project directory
    template_dir = './templates/node_js_postgres'
    shutil.copytree(os.path.join(template_dir), os.path.join(project_dir), symlinks=True, dirs_exist_ok=True) 

    # Run npm init -y
    subprocess.run(['npm', 'init', '-y'], cwd=project_dir)

    # Update package.json scripts
    package_json_path = os.path.join(project_dir, 'package.json')
    with open(package_json_path, 'r') as f:
        package_data = json.load(f)

    package_data['scripts']['start'] = 'node server.js'
    package_data['scripts']['start:dev'] = 'node --watch server.js'

    with open(package_json_path, 'w') as f:
        json.dump(package_data, f, indent=2)

    print(f"✅ Initialized npm project (package.json created).")

    # Install dependencies
    dependencies = ['express', 'sequelize', 'pg', 'pg-hstore', 'dotenv', 'cors']
    subprocess.run(['npm', 'install', *dependencies], cwd=project_dir)
    print(f"✅ Installed dependencies: {', '.join(dependencies)}.")

def main():
    print("🚀 Welcome to Node.js Scaffolder!")
    print("🟡 Let's generate a Node.js project from your DBML schema.")
    print("🟡 This script will call OpenAI to generate backend code based on your schema.")
    print("🟡 It will then create a new Node.js project with the generated code.")
    print("🟡 Let's get started!")
    print("")
    print("Please enter the name of your DBML schema file (e.g., example.dbml), or press enter to use our example:")
    dbml_file = input().strip()
    if not dbml_file:
        dbml_file = "example.dbml"

    print("Please enter the name of your Node.js project, or press enter to use our default:")
    project_name = input().strip()
    if not project_name:
        project_name = "my-nodejs-project"
    else:
        project_name = project_name.lower().replace(' ', '-')

    with open('./input/' + dbml_file, 'r') as file:
        dbml_schema = file.read()

    print("🟡 Calling OpenAI to generate backend code...")
    ai_response = call_openai(dbml_schema)

    print("🟡 Setting up initial project structure...")
    # setup_initial_files(project_name)
    setup_initial_files(project_name, 3000, 'gliba', 'test', 5432, 'localhost')

    print("🟡 Creating project files from AI response...")
    parse_and_create_files(ai_response, project_name)

    print("🚀 Project setup complete!")

if __name__ == "__main__":
    main()
