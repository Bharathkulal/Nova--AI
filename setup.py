from setuptools import setup, find_packages

setup(
    name="nova-ai",
    version="1.0.0",
    description="Jarvis-style conversational terminal assistant",
    author="Bharath",
    packages=find_packages(),
    install_requires=[
        "rich>=12.0.0",
        "openai>=1.0.0",
        "python-dotenv>=1.0.0",
        "typer>=0.9.0",
        "SpeechRecognition>=3.8.1",
        "pyttsx3>=2.90",
        "requests>=2.28.0",
    ],
    entry_points={
        "console_scripts": [
            "nova=main:main",
        ],
    },
)
