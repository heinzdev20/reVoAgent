#!/usr/bin/env python3
"""
Simple HTTP server that serves static files and proxies API requests
"""
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
from pathlib import Path

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent / "src/revoagent/ui/web_dashboard/static/dist"), **kwargs)
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_request()
        else:
            self.send_error(404)
    
    def proxy_request(self):
        try:
            import requests
            # Proxy to backend server
            backend_url = f"http://127.0.0.1:12001{self.path}"
            
            if self.command == 'GET':
                response = requests.get(backend_url, timeout=10)
                self.send_response(response.status_code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(response.content)
                
            elif self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                response = requests.post(
                    backend_url, 
                    data=post_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                self.send_response(response.status_code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                self.wfile.write(response.content)
                    
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_error(502, f"Bad Gateway: {e}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    PORT = 12002
    with socketserver.TCPServer(("0.0.0.0", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"🚀 Frontend server with API proxy running on port {PORT}")
        print(f"   Frontend: http://localhost:{PORT}")
        print(f"   API Proxy: http://localhost:{PORT}/api/* -> http://localhost:12001/api/*")
        httpd.serve_forever()