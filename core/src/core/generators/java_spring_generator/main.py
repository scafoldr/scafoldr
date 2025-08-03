from core.generators.base_generator import BaseGenerator
from core.generators.helpers.main import model_name, to_camel_case
from core.src.core.scafoldr_schema.dbml_scafoldr_schema_maker import from_dbml
from models.generate import GenerateRequest, GenerateResponse
from models.scafoldr_schema import DatabaseSchema
import os

from jinja2 import Environment, FileSystemLoader

TEMPLATES_DIR = "./templates/java_spring"

# configure Jinja2
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    trim_blocks=True,
    lstrip_blocks=True,
)

class JavaSpringGenerator(BaseGenerator):
    def get_static_files(self) -> dict[str, str]:
        template_dir = TEMPLATES_DIR
        predefined_code: dict[str, str] = {}
        for root, _, files in os.walk(template_dir):
            for file in files:
                # Skip Jinja2 templates
                if file.endswith('.j2'):
                    continue
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    # compute path relative to templates root
                    rel_path = os.path.relpath(file_path, template_dir)
                    rel_path = rel_path.replace('com.example.demo', 'com/example')
                    predefined_code[rel_path] = f.read()
        return predefined_code

    def _map_type(self, sql_type: str) -> str:
        t = sql_type.lower()
        if 'int' in t:
            return 'Integer'
        if 'char' in t or 'text' in t:
            return 'String'
        if 'bool' in t:
            return 'Boolean'
        if 'timestamp' in t:
            return 'Timestamp'
        if 'date' in t and 'timestamp' not in t:
            return 'LocalDate'
        if 'decimal' in t or 'numeric' in t:
            return 'BigDecimal'
        if 'float' in t:
            return 'Float'
        if 'double' in t:
            return 'Double'
        return 'String'

    def generate_entities(self, schema: DatabaseSchema) -> dict[str, str]:
        entity_tpl = env.get_template('src/main/java/com.example.demo/models/model_formula.j2')
        out: dict[str, str] = {}
        for tbl in schema.tables:
            ClassName = model_name(tbl.name)
            imports = {'jakarta.persistence.*', 'lombok.*'}
            fields = []
            for col in tbl.columns:
                java_type = self._map_type(col.type)
                # add type-specific imports
                if java_type == 'Timestamp':
                    imports.add('java.sql.Timestamp')
                elif java_type == 'LocalDate':
                    imports.add('java.time.LocalDate')
                elif java_type == 'LocalDateTime':
                    imports.add('java.time.LocalDateTime')
                elif java_type == 'BigDecimal':
                    imports.add('java.math.BigDecimal')
                fields.append({
                    'name': col.name,
                    'type': java_type,
                    'primaryKey': col.pk,
                    'nullable': not col.not_null,
                })
            content = entity_tpl.render(
                ClassName=ClassName,
                table_name=tbl.name.lower(),
                fields=fields,
                imports=sorted(imports)
            )
            out[f'src/main/java/com/example/models/{ClassName}.java'] = content
        return out

    def generate_repositories(self, schema: DatabaseSchema) -> dict[str, str]:
        repo_tpl = env.get_template('src/main/java/com.example.demo/repositories/repository_formula.j2')
        out: dict[str, str] = {}
        for tbl in schema.tables:
            ClassName = model_name(tbl.name)
            content = repo_tpl.render(
                ClassName=ClassName,
            )
            out[f'src/main/java/com/example/repositories/{ClassName}Repository.java'] = content
        return out

    def generate_services(self, schema: DatabaseSchema) -> dict[str, str]:
        service_tpl = env.get_template('src/main/java/com.example.demo/services/service_formula.j2')
        out: dict[str, str] = {}
        for tbl in schema.tables:
            ClassName = model_name(tbl.name)
            var_name = to_camel_case(tbl.name) + 'Repository'
            content = service_tpl.render(
                ClassName=ClassName,
                var_name=var_name
            )
            out[f'src/main/java/com/example/services/{ClassName}Service.java'] = content
        return out

    def generate_controllers(self, schema: DatabaseSchema) -> dict[str, str]:
        ctrl_tpl = env.get_template('src/main/java/com.example.demo/controllers/controller_formula.j2')
        out: dict[str, str] = {}
        for tbl in schema.tables:
            ClassName = model_name(tbl.name)
            var_name = to_camel_case(tbl.name) + 'Service'
            content = ctrl_tpl.render(
                ClassName=ClassName,
                var_name=var_name,
                path=tbl.name.lower()
            )
            out[f'src/main/java/com/example/controllers/{ClassName}Controller.java'] = content
        return out

    def generate_dtos(self, schema: DatabaseSchema) -> dict[str, str]:
        tpl = env.get_template('src/main/java/com.example.demo/dtos/dto_formula.j2')
        out: dict[str, str] = {}
        for tbl in schema.tables:
            ClassName = model_name(tbl.name)
            modelVar = to_camel_case(tbl.name)
            imports = {f'com.example.models.{ClassName}'}
            fields = []
            for col in tbl.columns:
                java_type = self._map_type(col.type)
                if java_type == 'Timestamp': imports.add('java.sql.Timestamp')
                if java_type == 'LocalDate': imports.add('java.time.LocalDate')
                if java_type == 'LocalDateTime': imports.add('java.time.LocalDateTime')
                if java_type == 'BigDecimal': imports.add('java.math.BigDecimal')
                fields.append({'name': col.name, 'type': java_type})
            content = tpl.render(ClassName=ClassName, model_var=modelVar, fields=fields, imports=sorted(imports))
            out[f'src/main/java/com/example/dtos/{ClassName}DTO.java'] = content
        return out

    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print('Generating Java Spring Boot code')
        schema = from_dbml(request.user_input)
        files: dict[str, str] = {
            **self.get_static_files(),
            **self.generate_entities(schema),
            **self.generate_repositories(schema),
            **self.generate_services(schema),
            **self.generate_controllers(schema),
            **self.generate_dtos(schema)
        }
        return GenerateResponse(files=files, commands=[])
