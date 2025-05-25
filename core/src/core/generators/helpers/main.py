from inflect import engine

inflect_engine = engine()

def to_camel_case(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])

def model_name(entity_name: str) -> str:
    camel_case = to_camel_case(entity_name)
    model_name = camel_case[0].upper() + camel_case[1:]
    singular_model_name = inflect_engine.singular_noun(model_name)

    return singular_model_name

