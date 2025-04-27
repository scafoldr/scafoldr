import inflect

from core.generators.base_generator import BaseGenerator
from models.generate import GenerateRequest, GenerateResponse
from pydbml import PyDBML
from pydbml.database import Database
import os
from inflect import engine

class NodeExpressJSGenerator(BaseGenerator):
    def get_static_files(self, request: GenerateRequest) -> dict[str, str]:
        template_dir = "./templates/node_express_js"
        predefined_code = {}
        for root, _, files in os.walk(template_dir):
            for file in files:
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    relative_path = os.path.relpath(file_path, template_dir)
                    predefined_code[relative_path] = f.read()

        return predefined_code
    
    def _map_type(self, sql_type: str) -> str:
        t = sql_type.lower()
        if "int" in t:     return "INTEGER"
        if "char" in t or "text" in t: return "STRING"
        if "bool" in t:    return "BOOLEAN"
        if "date" in t:    return "DATE"
        if "decimal" in t: return "DECIMAL"
        if "float" in t:   return "FLOAT"
        return "STRING"

    def generate_models(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        out = {}
        inflect_engine = inflect.engine()
        for tbl in schema.tables:
            Model = inflect_engine.singular_noun(tbl.name.capitalize())
            lines = [
                "module.exports = (sequelize) => {",
                f"  const {Model} = sequelize.define('{Model}', {{"
            ]
            for col in tbl.columns:
                parts = [
                    f"type: sequelize.Sequelize.{self._map_type(col.type)}",
                    f"allowNull: {str(not col.not_null).lower()}"
                ]
                if col.pk:
                    parts.insert(0, "primaryKey: true")
                lines.append(f"    {col.name}: {{ " + ", ".join(parts) + " },")
            lines += [
                "  }, {",
                f"    tableName: '{tbl.name.lower()}',",
                "  });",
                f"  return {Model};",
                "};"
            ]
            out[f"src/models/{Model}.js"] = "\n".join(lines)

        return out

    def generate_models_index(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        inflect_engine = engine()

        lines = [
            "const sequelize = require('../../config/database');",
            ""
        ]
        models = []
        # 1) Require each model
        for tbl in schema.tables:
            singular = inflect_engine.singular_noun(tbl.name) or tbl.name
            Model = singular[0].upper() + singular[1:]
            lines.append(f"const {Model} = require('./{Model}')(sequelize);")
            models.append((tbl.name, Model))
        lines.append("")
        lines.append("// Define associations")


        # 2) one-to-many / many-to-one
        for ref in schema.refs:
            if ref.type not in ('>', '<'):
                continue

            # pick columns based on arrow direction
            if ref.type == '>':  # left > right  → left is “many”, right is “one”
                many_col = ref.col1[0]
                one_col = ref.col2[0]
            else:  # left < right  → left is “one”,  right is “many”
                many_col = ref.col2[0]
                one_col = ref.col1[0]

            ManyModel = inflect_engine.singular_noun(many_col.table.name) or many_col.table.name
            OneModel = inflect_engine.singular_noun(one_col.table.name) or one_col.table.name
            MM = ManyModel[0].upper() + ManyModel[1:]
            OM = OneModel[0].upper() + OneModel[1:]
            fk = many_col.name

            # many side belongsTo one side
            lines.append(f"{MM}.belongsTo({OM}, {{ foreignKey: '{fk}' }});")
            # one side hasMany   many side
            lines.append(f"{OM}.hasMany({MM}, {{ foreignKey: '{fk}' }});")

        # 4) Export all models
        lines.append("")
        lines.append("module.exports = {")
        for _, Model in models:
            lines.append(f"  {Model},")
        lines.append("};")

        return {"src/models/index.js": "\n".join(lines)}


    
    def generate_repositories(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        out = {}
        inflect_engine = inflect.engine()
        for tbl in schema.tables:
            Model = inflect_engine.singular_noun(tbl.name.capitalize())
            repo = [
                "const BaseRepository = require('./BaseRepository');",
                f"const {{ {Model} }} = require('../models');",
                "",
                f"class {Model}Repository extends BaseRepository {{",
                "  constructor() {",
                f"    super({Model});",
                "  }",
                "}",
                "",
                f"module.exports = {Model}Repository;",
                "",
            ]
            out[f"src/repositories/{Model}Repository.js"] = "\n".join(repo)
        return out

    def generate_services(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        out = {}
        inflect_engine = inflect.engine()
        for tbl in schema.tables:
            Model = inflect_engine.singular_noun(tbl.name.capitalize())
            variableName = Model[0].lower() + Model[1:] + "Repository"
            svc = [
                "const BaseService = require('./BaseService');",
                f"const {Model}Repository = require('../repositories/{Model}Repository');",
                "",
                f"class {Model}Service extends BaseService {{",
                "  constructor() {",
                f"    const {variableName} = new {Model}Repository();",
                f"    super({variableName});",
                "  }",
                "}",
                f"module.exports = new {Model}Service();",
            ]
            out[f"src/services/{Model}Service.js"] = "\n".join(svc)
        return out

    def generate_controllers(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        out = {}
        inflect_engine = inflect.engine()
        for tbl in schema.tables:
            Model = inflect_engine.singular_noun(tbl.name.capitalize())
            ctrl = [
                "const BaseController = require('./BaseController');",
                f"const {Model}Service = require('../services/{Model}Service');",
                "",
                f"class {Model}Controller extends BaseController {{",
                "  constructor() {",
                f"    super({Model}Service);",
                "  }",
                "}",
                "",
                f"module.exports = new {Model}Controller();",
            ]
            out[f"src/controllers/{Model}Controller.js"] = "\n".join(ctrl)
        return out

    def generate_routes(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        out = {}
        inflect_engine = inflect.engine()

        for tbl in schema.tables:
            # Determine singular Model name
            raw = tbl.name.capitalize()
            Model = inflect_engine.singular_noun(raw) or raw
            var = Model[0].lower() + Model[1:] + "Controller"
            route_file = tbl.name.lower()  # e.g. "users" -> "users.js"

            lines = [
                "const express = require('express');",
                "const router = express.Router();",
                f"const {var} = require('../controllers/{Model}Controller');",
                "",
                f"router.get('/', {var}.getAll.bind({var}));",
                f"router.get('/:id', {var}.getById.bind({var}));",
                f"router.post('/', {var}.create.bind({var}));",
                f"router.put('/:id', {var}.update.bind({var}));",
                f"router.delete('/:id', {var}.delete.bind({var}));",
                "",
                "module.exports = router;"
            ]

            out[f"src/routes/{route_file}.js"] = "\n".join(lines)

        return out
        
    def generate_app_file(self, request: GenerateRequest, schema: Database) -> dict[str, str]:
        inflect_engine = engine()  # from `from inflect import engine`
        lines = [
            "const express = require('express');",
            "const cors = require('cors');",
            ""
        ]

        # import each router
        for tbl in schema.tables:
            singular = inflect_engine.singular_noun(tbl.name) or tbl.name
            name_lower = singular.lower()
            lines.append(f"const {name_lower}Routes = require('./routes/{name_lower}');")
        lines += [
            "",
            "const app = express();",
            "",
            "app.use(cors());",
            "app.use(express.json());",
            ""
        ]

        # mount each under /api/<plural>
        for tbl in schema.tables:
            singular = inflect_engine.singular_noun(tbl.name) or tbl.name
            name_lower = singular.lower()
            plural = tbl.name.lower()
            lines.append(f"app.use('/api/{plural}', {name_lower}Routes);")
        lines += [
            "",
            "module.exports = app;"
        ]

        return {"src/app.js": "\n".join(lines)}


    def generate(self, request: GenerateRequest) -> GenerateResponse:
        print("Generating Node.js Express code")
        schema = PyDBML(request.user_input)
        files: dict[str,str] = {
            **self.get_static_files(request),
            **self.generate_models(request, schema),
            **self.generate_models_index(request, schema),
            **self.generate_repositories(request, schema),
            **self.generate_services(request, schema),
            **self.generate_controllers(request, schema),
            **self.generate_routes(request, schema),
            **self.generate_app_file(request, schema),
        }


        return GenerateResponse(files=files, commands=[])

