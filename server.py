import http.server
import socket
import socketserver
import os
import sys
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_POST(self):
        url_parts = self.path.split('?')
        path_only = url_parts[0].rstrip('/')
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len).decode('utf-8', errors='ignore')
        import json
        import base64
        body_data = {}
        if post_body:
            try:
                body_data = json.loads(post_body)
            except Exception:
                pass

        # 1. File Upload: POST /api/upload
        if path_only == '/api/upload':
            file_name = body_data.get('fileName', '')
            file_data = body_data.get('fileData', '')
            file_type = body_data.get('fileType', 'application/octet-stream')

            if not file_name or not file_data:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'fileName and fileData (base64) required'}).encode('utf-8'))
                return

            try:
                if ',' in file_data:
                    file_data = file_data.split(',', 1)[1]
                raw_bytes = base64.b64decode(file_data)
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': f'Invalid base64 encoding: {str(e)}'}).encode('utf-8'))
                return

            if len(raw_bytes) > 25 * 1024 * 1024:
                self.send_response(413)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'File size exceeds maximum permitted 25MB.'}).encode('utf-8'))
                return

            uploads_dir = os.path.join(DIRECTORY, 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            import time
            safe_name = f"sub_{int(time.time()*1000)}_{os.path.basename(file_name)}"
            target_path = os.path.join(uploads_dir, safe_name)
            with open(target_path, 'wb') as f:
                f.write(raw_bytes)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            resp = {
                'success': True,
                'file': {
                    'fileName': safe_name,
                    'originalName': file_name,
                    'size': len(raw_bytes),
                    'mimeType': file_type,
                    'downloadUrl': f'/api/files/{safe_name}'
                }
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
            return

        # 2. Student Submit & Faculty Grade
        normalized = path_only.replace('/api/assignments/', '/api/records/')
        records_file = os.path.join(DIRECTORY, 'data', 'records.json')
        records_data = {}
        if os.path.exists(records_file):
            try:
                with open(records_file, 'r', encoding='utf-8') as f:
                    records_data = json.load(f)
            except Exception:
                pass

        if normalized.endswith('/submit'):
            parts = [p for p in normalized.split('/') if p]
            if len(parts) >= 4:
                rtype = parts[2].lower()
                rid = parts[3]
                item = next((r for r in records_data.get(rtype, []) if r.get('id') == rid), None)
                if item:
                    item['status'] = 'Submitted'
                    item['studentStatus'] = 'Submitted'
                    item['studentRemarks'] = body_data.get('notes', '')
                    item['submittedFile'] = body_data.get('file', None)
                    if item.get('submittedFile'):
                        item['submissionUrl'] = item['submittedFile'].get('downloadUrl', '')
                    with open(records_file, 'w', encoding='utf-8') as f:
                        json.dump(records_data, f, indent=2)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': True, 'data': item}).encode('utf-8'))
                    return

        if normalized.endswith('/grade'):
            parts = [p for p in normalized.split('/') if p]
            if len(parts) >= 4:
                rtype = parts[2].lower()
                rid = parts[3]
                item = next((r for r in records_data.get(rtype, []) if r.get('id') == rid), None)
                if item:
                    marks = body_data.get('marks', 0)
                    item['marks'] = f"{marks} / {item.get('maxMarks', 50)}"
                    item['studentMarks'] = marks
                    item['feedback'] = body_data.get('feedback', '')
                    item['status'] = 'Graded'
                    item['studentStatus'] = 'Graded'
                    with open(records_file, 'w', encoding='utf-8') as f:
                        json.dump(records_data, f, indent=2)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': True, 'data': item}).encode('utf-8'))
                    return

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'success': False, 'error': 'Endpoint not found'}).encode('utf-8'))

    def do_GET(self):
        url_parts = self.path.split('?')
        path_only = url_parts[0].rstrip('/')

        if path_only == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok","service":"StudyFlow AI"}')
            return

        # File Streaming: GET /api/files/:filename
        if path_only.startswith('/api/files/'):
            filename = os.path.basename(path_only.replace('/api/files/', ''))
            target_path = os.path.join(DIRECTORY, 'uploads', filename)
            if os.path.exists(target_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.end_headers()
                with open(target_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"success":false,"error":"File not found"}')
                return
        
        # Handle API Endpoints
        if path_only.startswith('/api/records/') or path_only.startswith('/api/assignments/'):
            normalized = path_only.replace('/api/assignments/', '/api/records/')
            parts = [p for p in normalized.split('/') if p]
            # parts will be ['api', 'records', type, (id)]
            records_file = os.path.join(DIRECTORY, 'data', 'records.json')
            records_data = {}
            if os.path.exists(records_file):
                try:
                    import json
                    with open(records_file, 'r', encoding='utf-8') as f:
                        records_data = json.load(f)
                except Exception:
                    pass
            
            if len(parts) >= 4:
                rtype = parts[2].lower()
                rid = parts[3]
                if rtype not in records_data:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(f'{{"success":false,"error":"Invalid record type \'{rtype}\'"}}'.encode('utf-8'))
                    return
                found = next((item for item in records_data.get(rtype, []) if item.get('id') == rid), None)
                if not found:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(f'{{"success":false,"error":"Record \'{rid}\' not found in {rtype}"}}'.encode('utf-8'))
                    return
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                import json
                self.wfile.write(json.dumps({'success': True, 'type': rtype, 'id': rid, 'data': found}).encode('utf-8'))
                return
            elif len(parts) == 3:
                rtype = parts[2].lower()
                if rtype not in records_data:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(f'{{"success":false,"error":"Invalid record type \'{rtype}\'"}}'.encode('utf-8'))
                    return
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                import json
                self.wfile.write(json.dumps({'success': True, 'type': rtype, 'count': len(records_data.get(rtype, [])), 'data': records_data.get(rtype, [])}).encode('utf-8'))
                return

        if path_only in ('', '/', '/landing', '/home'):
            self.path = '/landing.html'
        elif path_only in ('/login', '/auth'):
            self.path = '/login.html'
        elif path_only in ('/dashboard',):
            self.path = '/index.html'
        super().do_GET()

class DualStackServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception:
            pass
        super().server_bind()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    try:
        httpd = DualStackServer(('::', PORT), Handler)
    except Exception:
        httpd = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    
    url = f"http://localhost:{PORT}/landing.html"
    print("\n======================================================", flush=True)
    print("Student Placement Prediction System Live", flush=True)
    print("======================================================", flush=True)
    print(f"Default Startup (Landing Page): {url}", flush=True)
    print(f"Application Dashboard:          http://localhost:{PORT}/", flush=True)
    print(f"Student Overview:               http://localhost:{PORT}/#/student/overview", flush=True)
    print(f"Student Profile:                http://localhost:{PORT}/#/student/profile", flush=True)
    print(f"Faculty Mentoring Dashboard:    http://localhost:{PORT}/#/faculty/overview", flush=True)
    print(f"T&P Officer Portal:             http://localhost:{PORT}/#/officer/overview", flush=True)
    print(f"Authentication Portal:          http://localhost:{PORT}/login.html", flush=True)
    print("======================================================\n", flush=True)

    if not os.environ.get('NO_AUTO_OPEN') and not os.environ.get('CI'):
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
