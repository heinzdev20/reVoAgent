import React from 'react';

export function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 reVoAgent Frontend Test</h1>
      <p>✅ React is working!</p>
      <p>✅ TypeScript is working!</p>
      <p>✅ Frontend server is running!</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Backend API Test</h3>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/dashboard/stats');
              const data = await response.json();
              alert('✅ Backend API working! Engines: ' + Object.keys(data.engines).join(', '));
            } catch (error) {
              alert('❌ Backend API error: ' + error);
            }
          }}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Test Backend API
        </button>
      </div>
    </div>
  );
}