import React from 'react';
import { Code2 } from 'lucide-react';

export function SimpleCodeGenerator() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Code Generator</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Generate Code</h2>
        <p className="text-gray-600 mb-4">
          This is a simplified version of the Code Generator component for testing.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe what you want to generate..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="fastapi">FastAPI</option>
                <option value="react">React</option>
                <option value="express">Express</option>
              </select>
            </div>
          </div>
          
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Generate Code
          </button>
        </div>
      </div>
    </div>
  );
}