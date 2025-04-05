# 🤝 Contributing to Scafoldr

Thanks for your interest in contributing! Scafoldr is built to be modular and extensible, and we welcome contributions for new backend stacks, features, or improvements.

---

## 📦 Adding a New Backend Option

To add a new backend stack (e.g., Java Spring, Ruby on Rails, etc.), follow these steps:

### 1. Add CLI Support

Update the CLI to make your new backend available in the interactive prompt:

- File: `src/cli/main.py`
- Add your backend to the `BACKEND_OPTIONS` list:

```python
BACKEND_OPTIONS = [
    {"name": "Java Spring", "value": "java-spring"},
    # other options...
]
```

### 2. Register Generator in the Factory
Add an entry to the generator factory so your stack is recognized:

File: src/core/generators/generator_factory.py
```python
from core.generators.java_spring_generator.main import JavaSpringGenerator

GENERATOR_MAP = {
    "java-spring": JavaSpringGenerator,
    # other mappings...
}
```

### 3. Implement the Generator
```python
src/core/generators/java_spring_generator/
```
Then implement:
- main.py: the main generator class that returns GenerateResponse
- prompt.py: prompt builder to generate an AI-friendly prompt based on user input

### 4. Add Templates
If your generator uses static templates, add them here:
```python
templates/java-spring/
```

## 📚 Example PR
See this pull request for a full example of adding a Java Spring generator:
🔗 https://github.com/DimitrijeGlibic/scafoldr/pull/13

## 🧪 Testing
Make sure to:
- Test via CLI
- Test bia API

## 💬 Questions?
Feel free to open an issue or discussion if you need help getting started!
