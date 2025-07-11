from pydbml import PyDBML

from models.scafoldr_schema import DatabaseSchema, Table, Column, Reference, RefColumn


def from_dbml(dbml: str) -> DatabaseSchema:
    """Parse DBML string into a DatabaseSchema model."""
    db = PyDBML(dbml)

    tables = []
    for tbl in db.tables:
        columns = [
            Column(
                name=col.name,
                type=col.type,
                not_null=col.not_null,
                pk=col.pk,
            #     TODO: Add default and unique fields
            #     unique=col.unique,
            #     default=col.default
            )
            for col in tbl.columns
        ]
        tables.append(Table(name=tbl.name, columns=columns))

    refs = []
    for ref in getattr(db, "refs", []):
        if not ref.col1 or not ref.col2:
            continue
        col1 = ref.col1[0]
        col2 = ref.col2[0]
        refs.append(
            Reference(
                type=ref.type,
                col1=RefColumn(table=col1.table.name, name=col1.name),
                col2=RefColumn(table=col2.table.name, name=col2.name),
            )
        )

    return DatabaseSchema(tables=tables, refs=refs)
