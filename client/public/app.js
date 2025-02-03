// const API_BASE = 'https://notes-app-two-virid.vercel.app';
let authSection = document.getElementById('auth-section');
let notesSection = document.getElementById('notes-section');
let notesList = document.getElementById('notes-list');
let isRegistering = false;

// Auth Form Toggle
document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    document.getElementById('auth-title').textContent = isRegistering ? 'Register' : 'Login';
    document.getElementById('username-field').style.display = isRegistering ? 'block' : 'none';
    document.getElementById('toggle-auth').textContent = isRegistering 
        ? 'Already have an account? Login' 
        : 'Create an account';
});

// Handle Authentication
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    if(isRegistering) {
        payload.username = document.getElementById('username').value;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/${isRegistering ? 'register' : 'login'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if(response.ok) {
            localStorage.setItem('token', data.token);
            checkAuth();
        } else {
            alert(data.message || 'Authentication failed');
        }
    } catch(err) {
        alert('Error connecting to server');
    }
});

// Note Form Handler
document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = bootstrap.Modal.getInstance(document.getElementById('noteModal'));
    
    const noteData = {
        title: document.getElementById('note-title').value,
        content: document.getElementById('note-content').value
    };

    const noteId = document.getElementById('note-id').value;
    const url = noteId ? `${API_BASE}/notes/${noteId}` : `${API_BASE}/notes`;
    const method = noteId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(noteData)
        });

        if(response.ok) {
            modal.hide();
            await loadNotes();
        } else {
            const error = await response.json();
            alert(error.message || 'Operation failed');
        }
    } catch(err) {
        alert('Failed to save note');
    }
});

// Load Notes
async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if(!response.ok) throw new Error('Failed to load notes');
        
        const notes = await response.json();
        renderNotes(notes);
    } catch(err) {
        alert(err.message);
    }
}

// Render Notes
function renderNotes(notes) {
    notesList.innerHTML = notes.map(note => `
        <div class="col-md-4">
            <div class="note-card">
                <h5>${note.title}</h5>
                <p class="text-muted">${note.content}</p>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-sm btn-warning" onclick="editNote('${note._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNote('${note._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

//Edit Note
// In app.js
async function editNote(noteId) {
    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Critical
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch note');
      }
  
      const note = await response.json();
      
      // Populate form fields
      document.getElementById('note-id').value = note._id;
      document.getElementById('note-title').value = note.title;
      document.getElementById('note-content').value = note.content;
      
      new bootstrap.Modal(document.getElementById('noteModal')).show();
    } catch (err) {
      alert(err.message);
    }
  }

// Delete Note
async function deleteNote(noteId) {
    if(!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if(response.ok) {
            await loadNotes();
        } else {
            const error = await response.json();
            alert(error.message);
        }
    } catch(err) {
        alert('Failed to delete note');
    }
}

// Show Note Form
function showNoteForm() {
    document.getElementById('note-id').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    new bootstrap.Modal(document.getElementById('noteModal')).show();
}

// Check Authentication State
function checkAuth() {
    const token = localStorage.getItem('token');
    if(token) {
        authSection.style.display = 'none';
        notesSection.style.display = 'block';
        loadNotes();
    } else {
        authSection.style.display = 'block';
        notesSection.style.display = 'none';
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    checkAuth();
}

// Initialize
checkAuth();