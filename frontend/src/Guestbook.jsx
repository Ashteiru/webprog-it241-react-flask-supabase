import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Replace this with your actual Render URL in production
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/guestbook";

const Guestbook = () => {
    const [entries, setEntries] = useState([]);
    const [formData, setFormData] = useState({ name: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // 1. GET: Fetch all entries
    const fetchEntries = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setEntries(response.data);
            setError(null);
        } catch (err) {
            setError("The server is waking up... please wait a moment.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    // 2. POST: Add a new entry
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // 3. PUT: Update existing entry
                await axios.put(`${API_URL}/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post(API_URL, formData);
            }
            setFormData({ name: '', message: '' });
            fetchEntries();
        } catch (err) {
            alert("Failed to save entry.");
        }
    };

    // 4. DELETE: Remove an entry
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchEntries();
            } catch (err) {
                alert("Failed to delete.");
            }
        }
    };

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setFormData({ name: entry.name, message: entry.message });
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Guestbook</h2>

            {/* Form Section */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <textarea
                    placeholder="Leave a message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <button type="submit">
                    {editingId ? "Update Entry" : "Sign Guestbook"}
                </button>
                {editingId && <button onClick={() => setEditingId(null)}>Cancel</button>}
            </form>

            <hr />

            {/* Logic to handle Render's "Cold Start" */}
            {loading ? (
                <div className="loader">
                    <p>☕ Waking up the server... This may take 30 seconds on the first load.</p>
                </div>
            ) : error ? (
                <p style={{ color: 'orange' }}>{error}</p>
            ) : (
                <div className="entries">
                    {entries.length === 0 && <p>No entries yet. Be the first!</p>}
                    {entries.map((entry) => (
                        <div key={entry.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                            <strong>{entry.name}</strong>
                            <p>{entry.message}</p>
                            <button onClick={() => startEdit(entry)}>Edit</button>
                            <button onClick={() => handleDelete(entry.id)} style={{ color: 'red', marginLeft: '10px' }}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Guestbook;
