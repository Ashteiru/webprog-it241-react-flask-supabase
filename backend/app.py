import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app) # Crucial for allowing Vercel to talk to Render

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# Initialize Supabase client
# Note: On Render/Vercel, these env vars must be set in the dashboard.
# Local development requires a .env file loaded (e.g., via python-dotenv if we added it, 
# or manual export). To keep it simple as per instructions, we rely on os.environ.
if url and key:
    supabase: Client = create_client(url, key)
else:
    print("Warning: SUPABASE_URL and SUPABASE_KEY must be set in environment variables.")
    supabase = None

@app.route('/guestbook', methods=['GET'])
def get_entries():
    if not supabase:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        response = supabase.table("guestbook").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/guestbook', methods=['POST'])
def add_entry():
    if not supabase:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        data = request.json
        response = supabase.table("guestbook").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
         return jsonify({"error": str(e)}), 500

@app.route('/guestbook/<id>', methods=['PUT'])
def update_entry(id):
    if not supabase:
        return jsonify({"error": "Supabase not configured"}), 500
    try:
        data = request.json
        response = supabase.table("guestbook").update(data).eq("id", id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/guestbook/<id>', methods=['DELETE'])
def delete_entry(id):
    if not supabase:
         return jsonify({"error": "Supabase not configured"}), 500
    try:
        supabase.table("guestbook").delete().eq("id", id).execute()
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health Check Route
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Use the PORT variable provided by Render, default to 5000 for local dev
    port = int(os.environ.get("PORT", 5000))
    # Must bind to 0.0.0.0 for Render to detect the port
    app.run(host='0.0.0.0', port=port)
