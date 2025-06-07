#!/usr/bin/env python3
"""
Setup script for reVoAgent platform.
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# Read requirements
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    requirements = requirements_file.read_text().strip().split('\n')
    requirements = [req.strip() for req in requirements if req.strip() and not req.startswith('#')]

setup(
    name="revoagent",
    version="1.0.0",
    description="Revolutionary Agentic Coding System Platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="reVoAgent Team",
    author_email="team@revoagent.dev",
    url="https://github.com/heinzstkdev/reVoAgent",
    project_urls={
        "Documentation": "https://docs.revoagent.dev",
        "Source": "https://github.com/heinzstkdev/reVoAgent",
        "Tracker": "https://github.com/heinzstkdev/reVoAgent/issues",
    },
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.12",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
            "black>=23.9.0",
            "isort>=5.12.0",
            "flake8>=6.1.0",
            "mypy>=1.6.0",
            "pre-commit>=3.5.0",
        ],
        "docs": [
            "mkdocs>=1.5.0",
            "mkdocs-material>=9.4.0",
            "mkdocstrings[python]>=0.23.0",
        ],
        "all": [
            "revoagent[dev,docs]"
        ]
    },
    entry_points={
        "console_scripts": [
            "revoagent=revoagent.cli:main",
            "revoagent-server=revoagent.web_server:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Code Generators",
        "Topic :: Internet :: WWW/HTTP :: Browsers",
        "Topic :: System :: Software Distribution",
    ],
    keywords=[
        "ai", "agents", "coding", "automation", "software-engineering",
        "browser-automation", "llm", "local-models", "zero-cost",
        "code-generation", "debugging", "testing"
    ],
    include_package_data=True,
    package_data={
        "revoagent": [
            "config/*.yaml",
            "config/*.yml",
            "templates/*.html",
            "static/*",
        ],
    },
    zip_safe=False,
)