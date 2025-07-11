from core.generators.base_generator import BaseGenerator
from core.generators.helpers.main import model_name, to_camel_case
from core.scafoldr_schema_maker.schema_adapter import from_dbml
from models.generate import GenerateRequest, GenerateResponse
from models.scafoldr_schema import DatabaseSchema
import os

from jinja2 import Environment, FileSystemLoader, Template

TEMPLATES_DIR = "./templates/node_express_js"

# configure Jinja2
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    trim_blocks=True,
    lstrip_blocks=True,
)

class NodeExpressJSGenerator(BaseGenerator):
    def get_static_files(self) -> dict[str, str]:
        template_dir = "./templates/node_express_js"
        predefined_code = {}
        for root, _, files in os.walk(template_dir):
            for file in files:
                if file.endswith('.j2'):  # Skip .j2 files
                    continue
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    relative_path = os.path.relpath(file_path, template_dir)
                    predefined_code[relative_path] = f.read()

        # we need to do this manually since .env is in git ignore
        predefined_code['.env'] = predefined_code['.env.example']

        return predefined_code
    
    def _map_type(self, sql_type: str) -> str:
        t = sql_type.lower()
        if "int" in t:     return "INTEGER"
        if "char" in t or "text" in t: return "STRING"
        if "bool" in t:    return "BOOLEAN"
        if "date" in t or "timestamp" in t:    return "DATE"
        if "decimal" in t: return "DECIMAL"
        if "float" in t:   return "FLOAT"
        return "STRING"

    def generate_models(self, schema: DatabaseSchema) -> dict[str, str]:
        model_tpl = env.get_template("/src/models/model_formula.j2")
        out: dict[str, str] = {}
        for tbl in schema.tables:
            Model = model_name(tbl.name)
            table_name = tbl.name.lower()
            # build a list of simple dicts for Jinja
            columns = []
            for col in tbl.columns:
                columns.append({
                    "name":       col.name,
                    "mapped_type": self._map_type(col.type),
                    "allowNull":  not col.not_null,
                    "pk":         col.pk,
                })

            content = model_tpl.render(
                Model=Model,
                table_name=table_name,
                columns=columns,
            )

            out[f"src/models/{Model}.js"] = content
        return out

    def generate_models_index(self, schema: DatabaseSchema) -> dict[str, str]:
        models_index_tpl = env.get_template("/src/models/models_index_formula.j2")
        # 1) prepare table list
        tables = [
            {"Model": model_name(tbl.name)}
            for tbl in schema.tables
        ]

        # 2) build association lines
        associations: list[str] = []
        for ref in schema.refs:
            if ref.type not in ('>', '<'):
                continue

            # decide which side is many vs. one
            if ref.type == '>':
                many_col, one_col = ref.col1, ref.col2
            else:
                many_col, one_col = ref.col2, ref.col1

            ManyModel = model_name(many_col.table)
            OneModel  = model_name(one_col.table)
            fk         = many_col.name

            associations.append(
                f"{ManyModel}.belongsTo({OneModel}, {{ foreignKey: '{fk}' }});"
            )
            associations.append(
                f"{OneModel}.hasMany({ManyModel}, {{ foreignKey: '{fk}' }});"
            )

        # 3) render template
        content = models_index_tpl.render(
            tables=tables,
            associations=associations
        )

        return {"src/models/index.js": content}



    
    def generate_repositories(self, schema: DatabaseSchema) -> dict[str, str]:
        repo_tpl = env.get_template("/src/repositories/repository_formula.j2")
        out: dict[str, str] = {}
        for tbl in schema.tables:
            Model = model_name(tbl.name)

            content = repo_tpl.render(
                Model=Model
            )

            out[f"src/repositories/{Model}Repository.js"] = content
        return out



    def generate_services(self, schema: DatabaseSchema) -> dict[str, str]:
        service_tpl = env.get_template("/src/services/service_formula.j2")
        out: dict[str, str] = {}
        for tbl in schema.tables:
            Model = model_name(tbl.name)
            variable_name = to_camel_case(tbl.name) + "Repository"

            # render the external template
            content = service_tpl.render(
                Model=Model,
                variable_name=variable_name,
            )

            out[f"src/services/{Model}Service.js"] = content
        return out

    def generate_controllers(self, schema: DatabaseSchema) -> dict[str, str]:
        controller_tpl = env.get_template("/src/controllers/controller_formula.j2")
        out: dict[str, str] = {}
        for tbl in schema.tables:
            Model = model_name(tbl.name)

            content = controller_tpl.render(
                Model=Model
            )

            out[f"src/controllers/{Model}Controller.js"] = content
        return out

    def generate_routes(self, schema: DatabaseSchema) -> dict[str, str]:
        route_tpl = env.get_template("/src/routes/route_formula.j2")
        out: dict[str, str] = {}
        for tbl in schema.tables:
            Model = model_name(tbl.name)
            var = to_camel_case(tbl.name) + "Controller"
            route_file = f"{tbl.name.lower()}.js"

            content = route_tpl.render(
                Model=Model,
                var=var
            )

            out[f"src/routes/{route_file}"] = content
        return out

        
    def generate_app_file(self, schema: DatabaseSchema) -> dict[str, str]:
        app_tpl = env.get_template("/src/app_formula.j2")
        # prepare a list of route imports & mounts
        tables = [
            {
                "var": to_camel_case(tbl.name) + "Routes",
                "plural": tbl.name.lower()
            }
            for tbl in schema.tables
        ]

        content = app_tpl.render(tables=tables)
        return {"src/app.js": content}


    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print("Generating Node.js Express code")
        schema = from_dbml(request.user_input)
        files: dict[str,str] = {
            **self.get_static_files(),
            **self.generate_models(schema),
            **self.generate_models_index(schema),
            **self.generate_repositories(schema),
            **self.generate_services(schema),
            **self.generate_controllers(schema),
            **self.generate_routes(schema),
            **self.generate_app_file(schema),
        }


        return GenerateResponse(files=files, commands=[])

