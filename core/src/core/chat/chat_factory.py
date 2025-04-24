from core.chat.base_chat import BaseChat
from core.chat.chats.dbml_chat.main import DBMLChat

# Define chat providers, if we want to add more chats in the future
CHAT_MAP = {
    'dbml-chat': DBMLChat,
}

def get_chat(chat_key: str) -> BaseChat:
    chat_class = CHAT_MAP.get(chat_key)

    if not chat_class:
        raise ValueError(f"No chat found for chat_key '{chat_key}'")

    return chat_class()
