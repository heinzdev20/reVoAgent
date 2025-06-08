# reVoAgent Project Structure

## 🎯 Entry Points
- **CLI**: `python main.py` - Interactive command-line interface
- **Server**: `python production_server.py` - Main web application server  
- **Demo**: `python demo.py` - Example usage and demonstrations
- **Frontend**: `cd frontend && npm run dev` - React development server

## 📁 Directory Structure (After Cleanup)
```
reVoAgent/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── src/revoagent/         # Main Python package
│   ├── agents/            # AI agent implementations
│   ├── ai/                # AI/ML core functionality
│   ├── core/              # Platform core
│   ├── engines/           # Processing engines
│   ├── tools/             # Integration tools
│   └── ui/                # UI components
│
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── fixtures/          # Test data
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── API.md             # API documentation
│   └── DEPLOYMENT.md      # Deployment guide
│
├── config/                # Configuration files
├── scripts/               # Utility scripts
├── main.py                # CLI entry point
├── production_server.py   # Main server
├── demo.py                # Demo/example usage
└── pyproject.toml         # Python project configuration
```

## 🚀 Quick Start
1. `pip install -e .` - Install package in development mode
2. `cd frontend && npm install` - Install frontend dependencies
3. `python production_server.py` - Start the main server
4. `pytest tests/` - Run test suite

## 🛠️ Development Workflow
- **Backend development**: `python production_server.py`
- **Frontend development**: `cd frontend && npm run dev`
- **Run tests**: `pytest tests/unit/` (fast) or `pytest tests/` (all)
- **Code formatting**: `black src/` and `isort src/`

## 📋 Cleanup Status
✅ PROJECT_STRUCTURE.md created
⏳ Junk files removal in progress
⏳ Test files reorganization in progress
⏳ Documentation consolidation in progress
