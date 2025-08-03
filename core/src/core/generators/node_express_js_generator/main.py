from core.generators.base_generator import BaseGenerator
from models.generate import GenerateResponse
from models.scafoldr_schema import ScafoldrSchema, DatabaseSchema, Entity, Attribute
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

    def generate_models(self, entities: list[Entity]) -> dict[str, str]:
        model_tpl = env.get_template("/src/models/model_formula.j2")
        out: dict[str, str] = {}
        for entity in entities:
            Model = entity.names.pascal_case.singular
            table_name = entity.names.snake_case.singular
            # build a list of simple dicts for Jinja
            columns = []
            for attr in entity.attributes:
                columns.append({
                    "name":       attr.names.snake_case.singular,
                    "mapped_type": self._map_type(attr.type),
                    "allowNull":  not attr.not_null,
                    "pk":         attr.pk,
                })

            content = model_tpl.render(
                Model=Model,
                table_name=table_name,
                columns=columns,
            )

            out[f"src/models/{Model}.js"] = content
        return out

    def generate_models_index(self, entities: list[Entity], database_schema: DatabaseSchema) -> dict[str, str]:
        models_index_tpl = env.get_template("/src/models/models_index_formula.j2")
        # 1) prepare table list
        tables = [
            {"Model": entity.names.pascal_case.singular}
            for entity in entities
        ]

        # 2) build association lines
        associations: list[str] = []
        for ref in database_schema.refs:
            if ref.type not in ('>', '<'):
                continue

            # decide which side is many vs. one
            if ref.type == '>':
                many_col, one_col = ref.col1, ref.col2
            else:
                many_col, one_col = ref.col2, ref.col1

            # Find entities by table name
            many_entity = next((e for e in entities if e.names.snake_case.singular == many_col.table), None)
            one_entity = next((e for e in entities if e.names.snake_case.singular == one_col.table), None)
            
            if many_entity and one_entity:
                ManyModel = many_entity.names.pascal_case.singular
                OneModel = one_entity.names.pascal_case.singular
                fk = many_col.name

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



    
    def generate_repositories(self, entities: list[Entity]) -> dict[str, str]:
        repo_tpl = env.get_template("/src/repositories/repository_formula.j2")
        out: dict[str, str] = {}
        for entity in entities:
            Model = entity.names.pascal_case.singular

            content = repo_tpl.render(
                Model=Model
            )

            out[f"src/repositories/{Model}Repository.js"] = content
        return out



    def generate_services(self, entities: list[Entity]) -> dict[str, str]:
        service_tpl = env.get_template("/src/services/service_formula.j2")
        out: dict[str, str] = {}
        for entity in entities:
            Model = entity.names.pascal_case.singular
            variable_name = entity.names.camel_case.singular + "Repository"

            # render the external template
            content = service_tpl.render(
                Model=Model,
                variable_name=variable_name,
            )

            out[f"src/services/{Model}Service.js"] = content
        return out

    def generate_controllers(self, entities: list[Entity]) -> dict[str, str]:
        controller_tpl = env.get_template("/src/controllers/controller_formula.j2")
        out: dict[str, str] = {}
        for entity in entities:
            Model = entity.names.pascal_case.singular

            content = controller_tpl.render(
                Model=Model
            )

            out[f"src/controllers/{Model}Controller.js"] = content
        return out

    def generate_routes(self, entities: list[Entity]) -> dict[str, str]:
        route_tpl = env.get_template("/src/routes/route_formula.j2")
        out: dict[str, str] = {}
        for entity in entities:
            Model = entity.names.pascal_case.singular
            var = entity.names.camel_case.singular + "Controller"
            route_file = f"{entity.names.snake_case.singular}.js"

            content = route_tpl.render(
                Model=Model,
                var=var
            )

            out[f"src/routes/{route_file}"] = content
        return out

        
    def generate_app_file(self, entities: list[Entity]) -> dict[str, str]:
        app_tpl = env.get_template("/src/app_formula.j2")
        # prepare a list of route imports & mounts
        tables = [
            {
                "var": entity.names.camel_case.singular + "Routes",
                "plural": entity.names.snake_case.plural
            }
            for entity in entities
        ]

        content = app_tpl.render(tables=tables)
        return {"src/app.js": content}


    def generate(self, schema: ScafoldrSchema) -> GenerateResponse:
        print("Generating Node.js Express code")
        entities = schema.backend_schema.entities if schema.backend_schema else []
        files: dict[str,str] = {
            **self.get_static_files(),
            **self.generate_models(entities),
            **self.generate_models_index(entities, schema.database_schema),
            **self.generate_repositories(entities),
            **self.generate_services(entities),
            **self.generate_controllers(entities),
            **self.generate_routes(entities),
            **self.generate_app_file(entities),
        }

        return GenerateResponse(files=files, commands=[])

