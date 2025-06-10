import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  Download, 
  Copy, 
  Rocket, 
  CheckCircle, 
  Clock,
  FileText,
  Database,
  Shield,
  TestTube,
  Package
} from 'lucide-react';
import { api, AGENT_TYPES, type AgentStatus, type AgentExecutionResult } from '../../services/api';

interface CodeGenTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  features: string[];
}

interface CodeGenProgress {
  task_id: string;
  current_phase: string;
  phase_progress: Record<string, number>;
  estimated_completion: string;
  quality_score: number;
  files_generated: string[];
  live_preview: string;
}

interface CodeGenRequest {
  task_description: string;
  template_id: string;
  language: string;
  framework: string;
  database: string;
  features: string[];
}

export function EnhancedCodeGenerator() {
  const [taskDescription, setTaskDescription] = useState(
    'Create a complete e-commerce API with user auth, product catalog, shopping cart, payment integration, and admin dashboard'
  );
  const [selectedTemplate, setSelectedTemplate] = useState('rest_api');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedFramework, setSelectedFramework] = useState('fastapi');
  const [selectedDatabase, setSelectedDatabase] = useState('postgresql');
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'tests', 'docs', 'docker', 'cicd']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<CodeGenProgress | null>(null);
  const [templates, setTemplates] = useState<CodeGenTemplate[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [codeFiles, setCodeFiles] = useState<Record<string, string>>({});

  const languages = ['python', 'typescript', 'javascript', 'java', 'go', 'rust'];
  const frameworks = {
    python: ['fastapi', 'django', 'flask', 'tornado'],
    typescript: ['react', 'nextjs', 'nestjs', 'express'],
    javascript: ['express', 'koa', 'hapi', 'meteor'],
    java: ['spring', 'quarkus', 'micronaut'],
    go: ['gin', 'echo', 'fiber', 'gorilla'],
    rust: ['actix', 'warp', 'rocket', 'axum']
  };
  const databases = ['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite'];
  const availableFeatures = ['auth', 'tests', 'docs', 'docker', 'cicd', 'monitoring', 'caching', 'logging'];

  const phases = [
    { id: 'architecture_planning', name: 'Architecture Planning', icon: FileText },
    { id: 'database_models', name: 'Database Models', icon: Database },
    { id: 'api_endpoints', name: 'API Endpoints', icon: Code2 },
    { id: 'authentication', name: 'Authentication', icon: Shield },
    { id: 'tests_documentation', name: 'Tests & Documentation', icon: TestTube }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/agents/code-generator/templates');
      setTemplates((response.data as any).templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback templates
      setTemplates([
        {
          id: 'rest_api',
          name: 'REST API',
          description: 'Complete REST API with authentication and database',
          language: 'python',
          framework: 'fastapi',
          features: ['auth', 'tests', 'docs', 'docker', 'cicd']
        },
        {
          id: 'web_app',
          name: 'Web App',
          description: 'Full-stack web application',
          language: 'typescript',
          framework: 'react',
          features: ['auth', 'tests', 'docs', 'docker', 'cicd']
        },
        {
          id: 'microservice',
          name: 'Microservice',
          description: 'Containerized microservice architecture',
          language: 'python',
          framework: 'fastapi',
          features: ['auth', 'tests', 'docs', 'docker', 'k8s', 'monitoring']
        }
      ]);
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGeneratedCode('');
    setGenerationResult(null);
    setProgress(null);
    
    try {
      // Prepare task data for the new backend API
      const taskData = {
        description: taskDescription,
        parameters: {
          template_id: selectedTemplate,
          language: selectedLanguage,
          framework: selectedFramework,
          database: selectedDatabase,
          features: selectedFeatures,
          generate_tests: selectedFeatures.includes('tests'),
          include_docker: selectedFeatures.includes('docker'),
          include_docs: selectedFeatures.includes('docs')
        }
      };

      console.log('Starting code generation with task data:', taskData);
      
      // Call the new backend API endpoint
      const response = await fetch('/api/agents/code-generator/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Code generation task started:', result);
      
      // Start polling for task progress
      const taskId = result.task_id;
      pollTaskProgress(taskId);
      
    } catch (error) {
      console.error('Failed to start code generation:', error);
      setIsGenerating(false);
      alert('Failed to start code generation. Please try again.');
    }
  };

  const pollTaskProgress = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        // Get task status from the new backend API
        const response = await fetch(`/api/agents/code-generator/tasks/${taskId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const task = await response.json();
        console.log('Task status:', task);
        
        // Update progress based on task status
        if (task.status === 'completed') {
          clearInterval(pollInterval);
          await handleTaskCompletion(task);
        } else if (task.status === 'failed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          alert(`Code generation failed: ${task.error || 'Unknown error'}`);
        } else {
          // Update progress for active task
          updateProgressDisplay(task);
        }
      } catch (error) {
        console.error('Error polling task progress:', error);
        clearInterval(pollInterval);
        setIsGenerating(false);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isGenerating) {
        setIsGenerating(false);
        alert('Code generation timed out. Please try again.');
      }
    }, 300000);
  };

  const updateProgressDisplay = (task: any) => {
    const statusToPhase = {
      'analyzing': 'architecture_planning',
      'preparing': 'database_models',
      'generating': 'api_endpoints',
      'processing': 'authentication',
      'completed': 'tests_documentation'
    };
    
    const currentPhase = statusToPhase[task.status] || 'architecture_planning';
    const phases = ['architecture_planning', 'database_models', 'api_endpoints', 'authentication', 'tests_documentation'];
    
    const phaseProgress: Record<string, number> = {};
    phases.forEach((phase, index) => {
      if (phase === currentPhase) {
        phaseProgress[phase] = Math.round(task.progress * 100);
      } else if (phases.indexOf(phase) < phases.indexOf(currentPhase)) {
        phaseProgress[phase] = 100;
      } else {
        phaseProgress[phase] = 0;
      }
    });
    
    setProgress({
      task_id: task.id,
      current_phase: currentPhase,
      phase_progress: phaseProgress,
      estimated_completion: task.status === 'completed' ? 'Completed' : '1-2 minutes remaining',
      quality_score: 0.94,
      files_generated: [],
      live_preview: `${task.status.charAt(0).toUpperCase() + task.status.slice(1)}...`
    });
  };

  const handleTaskCompletion = async (task: any) => {
    console.log('Code generation completed:', task);
    
    if (task.result) {
      const result = task.result;
      
      // Store the generated code and result
      setGeneratedCode(result.code || '');
      setGenerationResult(result);
      
      // Create multiple files for a complete project structure
      const projectFiles = {
        'main.py': result.code || generateMainFile(),
        'models.py': generateModelsFile(),
        'schemas.py': generateSchemasFile(),
        'auth.py': generateAuthFile(),
        'requirements.txt': generateRequirementsFile(),
        'Dockerfile': generateDockerfile(),
        'docker-compose.yml': generateDockerCompose(),
        'tests/test_main.py': generateTestFile(),
        'README.md': generateReadmeFile()
      };
      
      setCodeFiles(projectFiles);
      setSelectedFile('main.py');
      
      // Set up progress to show completion
      setProgress({
        task_id: task.id,
        current_phase: 'tests_documentation',
        phase_progress: {
          architecture_planning: 100,
          database_models: 100,
          api_endpoints: 100,
          authentication: 100,
          tests_documentation: 100
        },
        estimated_completion: 'Completed',
        quality_score: result.analysis?.security_score / 100 || 0.94,
        files_generated: Object.keys(projectFiles),
        live_preview: result.code || ''
      });
    }
    
    setIsGenerating(false);
  };

  const getTaskResult = async (taskId: string) => {
    try {
      // Get task history to find the completed task
      const history = await api.getAgentHistory(AGENT_TYPES.CODE_GENERATOR, 20);
      const completedTask = history.history.find(task => task.id === taskId);
      
      if (completedTask && completedTask.result) {
        const result = completedTask.result;
        console.log('Code generation completed:', result);
        
        // Store the generated code and result
        setGeneratedCode(result.code_preview || '');
        setGenerationResult(result);
        
        // Create multiple files for a complete project structure
        const projectFiles = {
          'main.py': result.code_preview || generateMainFile(),
          'models.py': generateModelsFile(),
          'schemas.py': generateSchemasFile(),
          'auth.py': generateAuthFile(),
          'requirements.txt': generateRequirementsFile(),
          'Dockerfile': generateDockerfile(),
          'docker-compose.yml': generateDockerCompose(),
          'tests/test_main.py': generateTestFile(),
          'README.md': generateReadmeFile()
        };
        
        setCodeFiles(projectFiles);
        setSelectedFile('main.py');
        
        // Set up progress to show completion
        setProgress({
          task_id: taskId,
          current_phase: 'tests_documentation',
          phase_progress: {
            architecture_planning: 100,
            database_models: 100,
            api_endpoints: 100,
            authentication: 100,
            tests_documentation: 100
          },
          estimated_completion: 'Completed',
          quality_score: result.quality_score || 0.94,
          files_generated: result.generated_files || Object.keys(projectFiles),
          live_preview: result.code_preview || ''
        });
      }
    } catch (error) {
      console.error('Error getting task result:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate main file content
  const generateMainFile = () => {
    return `# Generated ${selectedFramework.toUpperCase()} Application
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="${taskDescription}",
    description="Generated API using reVoAgent",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to your generated API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
  };

  const pollProgress = async (taskId: string) => {
    try {
      const response = await api.get(`/agents/code-generator/progress/${taskId}`);
      setProgress(response.data as CodeGenProgress);
      
      if ((response.data as any).current_phase !== 'completed') {
        setTimeout(() => pollProgress(taskId), 2000);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Failed to get progress:', error);
      setIsGenerating(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getLanguageFromFile = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'jsx': return 'javascript';
      case 'yml':
      case 'yaml': return 'yaml';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'txt': return 'text';
      default: return 'text';
    }
  };

  // File generation helpers
  const generateModelsFile = () => `# Database Models
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
`;

  const generateSchemasFile = () => `# Pydantic Schemas
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock_quantity: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: int
    total_amount: float

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
`;

  const generateAuthFile = () => `# Authentication
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username
`;

  const generateRequirementsFile = () => `fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
`;

  const generateDockerfile = () => `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

  const generateDockerCompose = () => `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/ecommerce
    depends_on:
      - db
    volumes:
      - .:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecommerce
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  const generateTestFile = () => `# Tests
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Test Item", "description": "Test Description"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"

def test_read_items():
    response = client.get("/items/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_item():
    # First create an item
    create_response = client.post(
        "/items/",
        json={"name": "Test Item", "description": "Test Description"}
    )
    item_id = create_response.json()["id"]
    
    # Then read it
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    assert response.json()["id"] == item_id
`;

  const generateReadmeFile = () => `# E-Commerce API

A complete e-commerce API built with FastAPI, featuring user authentication, product catalog, shopping cart, and payment integration.

## Features

- 🔐 User Authentication with JWT tokens
- 📦 Product Management (CRUD operations)
- 🛒 Shopping Cart functionality
- 💳 Payment Integration ready
- 👨‍💼 Admin Dashboard endpoints
- 🐳 Docker containerization
- 🧪 Comprehensive test suite
- 📚 Auto-generated API documentation

## Quick Start

### Using Docker Compose (Recommended)

\`\`\`bash
docker-compose up --build
\`\`\`

### Manual Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Set up PostgreSQL database and update DATABASE_URL

3. Run the application:
\`\`\`bash
uvicorn main:app --reload
\`\`\`

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

\`\`\`bash
pytest
\`\`\`

## Environment Variables

- \`DATABASE_URL\`: PostgreSQL connection string
- \`SECRET_KEY\`: JWT secret key
- \`ACCESS_TOKEN_EXPIRE_MINUTES\`: Token expiration time

## Project Structure

\`\`\`
├── main.py              # FastAPI application
├── models.py            # Database models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication logic
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Multi-container setup
├── tests/
│   └── test_main.py     # Test suite
└── README.md            # This file
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
`;

  const downloadCode = () => {
    if (progress?.live_preview) {
      const blob = new Blob([progress.live_preview], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated_code.py';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Code Generator</h1>
        </div>
        <p className="text-gray-600">
          AI-powered code generation with OpenHands integration, supporting multiple languages and frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Task Description */}
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Task Description</h3>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you want to build..."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {frameworks[selectedLanguage as keyof typeof frameworks]?.map(fw => (
                    <option key={fw} value={fw}>{fw.charAt(0).toUpperCase() + fw.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
                <select
                  value={selectedDatabase}
                  onChange={(e) => setSelectedDatabase(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {databases.map(db => (
                    <option key={db} value={db}>{db.charAt(0).toUpperCase() + db.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map(feature => (
                  <button
                    key={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFeatures.includes(feature)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {selectedFeatures.includes(feature) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Generation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generation Progress */}
          {progress && (
            <div className="metric-card">
              <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
              <div className="space-y-3">
                {phases.map((phase, index) => {
                  const phaseProgress = progress.phase_progress[phase.id] || 0;
                  const Icon = phase.icon;
                  const isActive = progress.current_phase === phase.id;
                  const isCompleted = phaseProgress === 100;
                  
                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-blue-600' : 'text-gray-700'
                          }`}>
                            Phase {index + 1}: {phase.name}
                          </span>
                          <span className="text-sm text-gray-500">{phaseProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' :
                              isActive ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Estimated completion:</span>
                  <span className="text-sm font-medium text-blue-800">{progress.estimated_completion}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-blue-700">Quality Score:</span>
                  <span className="text-sm font-medium text-blue-800">{progress.quality_score}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Code Workspace */}
        <div className="space-y-6">
          {/* VS Code-like Code Preview */}
          <div className="metric-card p-0 overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Live Code Preview</h3>
                {generationResult && (
                  <span className="text-xs bg-green-600 px-2 py-1 rounded">
                    {generationResult.model_used}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {Object.keys(codeFiles).length > 0 && (
                  <>
                    <button
                      onClick={() => copyToClipboard(codeFiles[selectedFile] || '')}
                      className="text-gray-300 hover:text-white p-1 rounded"
                      title="Copy Code"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => downloadFile(selectedFile, codeFiles[selectedFile] || '')}
                      className="text-gray-300 hover:text-white p-1 rounded"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {Object.keys(codeFiles).length > 0 ? (
              <div className="relative">
                {/* File Tabs */}
                <div className="bg-gray-700 flex overflow-x-auto">
                  {Object.keys(codeFiles).map((fileName) => (
                    <button
                      key={fileName}
                      onClick={() => setSelectedFile(fileName)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-r border-gray-600 ${
                        selectedFile === fileName
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>
                
                {/* Code Content */}
                <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto max-h-96 min-h-64">
                  <code className={`language-${getLanguageFromFile(selectedFile)}`}>
                    {codeFiles[selectedFile]}
                  </code>
                </pre>
                
                <div className="absolute bottom-2 right-2 bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                  {codeFiles[selectedFile]?.split('\n').length || 0} lines
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Ready to Generate Code</p>
                <p className="text-sm">Configure your project and click "Start Generation"</p>
              </div>
            )}
            
            {generationResult && (
              <div className="bg-gray-100 px-4 py-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">
                      Quality: <span className="font-medium text-green-600">{generationResult.quality_score}%</span>
                    </span>
                    <span className="text-gray-600">
                      Time: <span className="font-medium">{generationResult.completion_time}</span>
                    </span>
                    <span className="text-gray-600">
                      Lines: <span className="font-medium">{generationResult.estimated_lines}</span>
                    </span>
                  </div>
                  <button className="btn-primary text-xs px-3 py-1 flex items-center gap-1">
                    <Rocket className="w-3 h-3" />
                    Deploy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced File Structure */}
          <div className="metric-card p-0 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">Project Structure</h3>
              </div>
            </div>
            
            {progress?.files_generated.length ? (
              <div className="p-4">
                <div className="space-y-1">
                  {progress.files_generated.map((file, index) => {
                    const isFolder = file.includes('/');
                    const fileName = file.split('/').pop() || file;
                    const folderPath = file.includes('/') ? file.split('/').slice(0, -1).join('/') : '';
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center gap-2 text-sm p-1 rounded transition-colors ${
                          selectedFile === file
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {isFolder ? (
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="text-xs">{folderPath}/</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                          {fileName.endsWith('.py') ? (
                            <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">Py</span>
                            </div>
                          ) : fileName.endsWith('.md') ? (
                            <div className="w-3 h-3 bg-gray-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">MD</span>
                            </div>
                          ) : fileName.includes('Dockerfile') ? (
                            <div className="w-3 h-3 bg-blue-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">🐳</span>
                            </div>
                          ) : fileName.endsWith('.txt') ? (
                            <div className="w-3 h-3 bg-green-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">TXT</span>
                            </div>
                          ) : fileName.endsWith('.yml') || fileName.endsWith('.yaml') ? (
                            <div className="w-3 h-3 bg-orange-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">YML</span>
                            </div>
                          ) : (
                            <Package className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="font-mono">{fileName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{progress.files_generated.length} files generated</span>
                    <span>Ready for deployment</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Project structure will appear here</p>
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="metric-card">
            <h3 className="text-lg font-semibold mb-4">Templates</h3>
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}