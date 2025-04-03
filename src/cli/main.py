import typer
from InquirerPy import prompt
from core.orchestrator import generate_backend
from models.generate import GenerateRequest
import os
import subprocess

app = typer.Typer()

BACKEND_OPTIONS = [
    {"name": "Node.js Express (JavaScript)", "value": "nodejs-express-js"},
    # TODO: Need to implement these languages
    {"name": "Node.js Express (TypeScript)", "value": "nodejs-express-ts"},
]

# TODO: Need to implement these features
FEATURE_FLAGS = [
    ("Include Docker", "docker"),
    ("Include Linter", "linter"),
]

def ask_feature_flags() -> list[str]:
    features = []
    for label, value in FEATURE_FLAGS:
        answer = prompt([
            {
                "type": "confirm",
                "message": f"Include {label}?",
                "name": value,
                "default": True,
            }
        ])
        if answer[value]:
            features.append(value)
    return features


@app.command()
def generate(
    output_dir: str = './output'
):
    """Interactively generate backend code."""
    answers = prompt([
        {
            "type": "input",
            "name": "dbml_path",
            "message": "Enter path to DBML file:",
            "default": ""
        },
        {
            "type": "list",
            "name": "backend_option",
            "message": "Choose a tech stack:",
            "choices": BACKEND_OPTIONS
        },
        {
            "type": "input",
            "name": "project_name",
            "message": "Enter project name:"
        }
    ])

    features = ask_feature_flags()

    dbml_file_path = answers['dbml_path']
    if not dbml_file_path:
        dbml_file_path = "./input/example.dbml"

    project_name = answers['project_name'].strip()
    if not project_name:
        project_name = "my-scafoldr-project"
    else:
        project_name = project_name.lower().replace(' ', '-')

    database_name = project_name.replace('-', '_') + "_db"

    with open(dbml_file_path, 'r') as file:
        dbml_schema = file.read()

    project_path = os.path.join(output_dir, project_name)

    request = GenerateRequest(
        project_name=project_name,
        database_name=database_name,
        backend_option=answers["backend_option"],
        features=features,
        user_input=dbml_schema,
    )
    
    try:
        project_files = generate_backend(request)

        # Save files
        for path, content in project_files.files.items():
            full_path = os.path.join(project_path, path)

            print(f"Creating file: {full_path}")
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, 'w') as f:
                f.write(content)

        # Run commands
        for command in project_files.commands:
            print(f"Running command: {command} path: {project_path}")
            subprocess.run(command.split(' '), cwd=os.path.abspath(project_path))

        typer.secho("✅ Project generated successfully!", fg=typer.colors.GREEN)
    except Exception as e:
        typer.secho(f"❌ Error: {str(e)}", fg=typer.colors.RED)

if __name__ == "__main__":
    app()
