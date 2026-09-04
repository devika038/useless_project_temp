import os, uuid, tempfile, json, time, hashlib, threading
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_file, abort
from werkzeug.utils import secure_filename
from analysis.heuristics import analyze_image, generate_result

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB per file

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
SESSION_RESULTS = {}  # in-memory: session_id -> {result, expires_at}
SESSION_TTL = 1800  # 30 minutes

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_expired():
    """Remove expired sessions from memory."""
    now = time.time()
    expired = [k for k, v in SESSION_RESULTS.items() if v['expires_at'] < now]
    for k in expired:
        del SESSION_RESULTS[k]

def schedule_cleanup():
    """Run cleanup every 10 minutes in background."""
    while True:
        time.sleep(600)
        cleanup_expired()

threading.Thread(target=schedule_cleanup, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('files')
    if not files or len(files) == 0:
        return jsonify({'error': 'No files selected'}), 400
    if len(files) > 3:
        return jsonify({'error': 'Maximum 3 images allowed'}), 400

    session_id = str(uuid.uuid4())
    tmp_dir = tempfile.mkdtemp(prefix=f'kashandi_{session_id}_')
    file_paths = []

    for f in files:
        if f.filename == '':
            continue
        if not allowed_file(f.filename):
            return jsonify({'error': f'Invalid file type: {f.filename}'}), 400
        safe_name = secure_filename(f.filename)
        dest = os.path.join(tmp_dir, safe_name)
        f.save(dest)
        file_paths.append(dest)

    if not file_paths:
        return jsonify({'error': 'No valid files uploaded'}), 400

    # Store paths temporarily for analysis
    SESSION_RESULTS[session_id] = {
        'status': 'uploaded',
        'file_paths': file_paths,
        'tmp_dir': tmp_dir,
        'expires_at': time.time() + 300  # 5 min to analyze
    }

    return jsonify({'session_id': session_id, 'file_count': len(file_paths)})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({'error': 'session_id required'}), 400

    session_id = data['session_id']
    demo_mode = data.get('demo_mode', False)

    if demo_mode:
        result = generate_result([], demo_mode=True)
        result_session_id = str(uuid.uuid4())
        SESSION_RESULTS[result_session_id] = {
            'status': 'complete',
            'result': result,
            'expires_at': time.time() + SESSION_TTL
        }
        return jsonify({'session_id': result_session_id, 'result': result})

    if session_id not in SESSION_RESULTS:
        return jsonify({'error': 'Session not found or expired'}), 404

    session = SESSION_RESULTS[session_id]
    if session.get('status') == 'complete':
        return jsonify({'session_id': session_id, 'result': session['result']})

    file_paths = session.get('file_paths', [])
    raw_scores = []

    try:
        for fp in file_paths:
            if os.path.exists(fp):
                score = analyze_image(fp)
                raw_scores.append(score)
    finally:
        # Delete files immediately after analysis
        tmp_dir = session.get('tmp_dir')
        if tmp_dir and os.path.exists(tmp_dir):
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)

    result = generate_result(raw_scores)
    SESSION_RESULTS[session_id] = {
        'status': 'complete',
        'result': result,
        'expires_at': time.time() + SESSION_TTL
    }

    return jsonify({'session_id': session_id, 'result': result})

@app.route('/result/<session_id>', methods=['GET'])
def get_result(session_id):
    cleanup_expired()
    if session_id not in SESSION_RESULTS:
        return jsonify({'error': 'Result not found or expired'}), 404
    session = SESSION_RESULTS[session_id]
    if session.get('status') != 'complete':
        return jsonify({'error': 'Analysis not complete'}), 400
    return jsonify(session['result'])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': time.time()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
