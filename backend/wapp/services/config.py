# https://dev.to/yanagisawahidetoshi/efficiently-using-environment-variables-in-fastapi-4lal
# Loads environment variables from .env file and builds the database URL

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database settings
    MYSQL_HOST: str = os.getenv("MYSQL_HOST")
    MYSQL_USER: str = os.getenv("MYSQL_USER") 
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT"))

    # API settings
    API_HOST: str = os.getenv("API_HOST")
    API_PORT: int = int(os.getenv("API_PORT"))

    # CORS settings
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+mysqlconnector://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

settings = Settings() 