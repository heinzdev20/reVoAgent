import React, { useState } from 'react';
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
  Package,
  Loader2,
  AlertCircle,
  Settings,
  Eye,
  Save
} from 'lucide-react';

interface CodeGenTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  features: string[];
}

export function FixedCodeGenerator() {
  // Local component state only - no complex store dependencies
  const [taskDescription, setTaskDescription] = useState(
    'Create a complete e-commerce API with user auth, product catalog, shopping cart, payment integration, and admin dashboard'
  );
  const [selectedTemplate, setSelectedTemplate] = useState('rest_api');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedFramework, setSelectedFramework] = useState('fastapi');
  const [selectedDatabase, setSelectedDatabase] = useState('postgresql');
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'tests', 'docs', 'docker', 'cicd']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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

  const templates: CodeGenTemplate[] = [
    {
      id: 'rest_api',
      name: 'REST API',
      description: 'Complete REST API with authentication, CRUD operations, and documentation',
      language: 'python',
      framework: 'fastapi',
      features: ['auth', 'tests', 'docs']
    },
    {
      id: 'web_app',
      name: 'Web Application',
      description: 'Full-stack web application with frontend and backend',
      language: 'typescript',
      framework: 'react',
      features: ['auth', 'tests', 'docs', 'docker']
    },
    {
      id: 'microservice',
      name: 'Microservice',
      description: 'Containerized microservice with monitoring and health checks',
      language: 'go',
      framework: 'gin',
      features: ['monitoring', 'docker', 'tests']
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated code
      const mockCode = `# Generated ${selectedLanguage} code using ${selectedFramework}
# Task: ${taskDescription}

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Generated API", version="1.0.0")
security = HTTPBearer()

class User(BaseModel):
    id: int
    username: str
    email: str

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str

@app.get("/")
async def root():
    return {"message": "Generated API is running!"}

@app.get("/users", response_model=List[User])
async def get_users():
    # Mock users data
    return [
        User(id=1, username="admin", email="admin@example.com"),
        User(id=2, username="user", email="user@example.com")
    ]

@app.get("/products", response_model=List[Product])
async def get_products():
    # Mock products data
    return [
        Product(id=1, name="Laptop", price=999.99, description="High-performance laptop"),
        Product(id=2, name="Mouse", price=29.99, description="Wireless mouse")
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
      
      setGeneratedCode(mockCode);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Code Generator</h1>
          <p className="text-gray-600">AI-powered code generation with real-time progress tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>

            {/* Task Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe what you want to generate..."
              />
            </div>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Language and Framework */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {frameworks[selectedLanguage as keyof typeof frameworks]?.map(fw => (
                    <option key={fw} value={fw}>
                      {fw.charAt(0).toUpperCase() + fw.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Database */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database
              </label>
              <select
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {databases.map(db => (
                  <option key={db} value={db}>
                    {db.charAt(0).toUpperCase() + db.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Generate Code
                </>
              )}
            </button>
          </div>

          {/* Progress Panel */}
          {isGenerating && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Generation Progress
              </h3>
              
              <div className="space-y-3">
                {phases.map((phase, index) => {
                  const Icon = phase.icon;
                  const isActive = index === 2; // Mock active phase
                  const isCompleted = index < 2; // Mock completed phases
                  
                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`${
                        isActive ? 'text-blue-600 font-medium' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {phase.name}
                      </span>
                      {isActive && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Code Output Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Generated Code
              </h3>
              
              {generatedCode && (
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {generatedCode ? (
              <div className="bg-gray-900 rounded-md p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Generated code will appear here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Configure your settings and click "Generate Code" to start
                </p>
              </div>
            )}
          </div>

          {/* File Explorer */}
          {generatedCode && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Project Files
              </h3>
              
              <div className="space-y-2">
                {['main.py', 'models.py', 'routes.py', 'requirements.txt', 'Dockerfile'].map(file => (
                  <div
                    key={file}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedFile === file ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}