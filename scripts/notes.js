// Notes functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const newNoteBtn = document.getElementById('new-note-btn');
    const notesList = document.getElementById('notes-list');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const searchNotesInput = document.getElementById('search-notes');

    // Current note being edited
    let currentNoteId = null;

    // Load notes
    loadNotes();

    // Event listeners
    newNoteBtn.addEventListener('click', createNewNote);
    
    saveNoteBtn.addEventListener('click', saveNote);
    
    deleteNoteBtn.addEventListener('click', deleteNote);
    
    noteTitleInput.addEventListener('input', () => {
        saveNoteBtn.disabled = !noteTitleInput.value.trim();
    });
    
    noteContentInput.addEventListener('input', () => {
        if (currentNoteId) {
            saveNoteBtn.disabled = false;
        }
    });
    
    searchNotesInput.addEventListener('input', () => {
        const searchTerm = searchNotesInput.value.trim().toLowerCase();
        loadNotes(searchTerm);
    });

    // Functions
    function loadNotes(searchTerm = '') {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        if (notes.length === 0 && !searchTerm) {
            notesList.innerHTML = '<p class="empty-state">No notes yet. Create your first one!</p>';
            return;
        }
        
        // Filter notes by search term if provided
        const filteredNotes = searchTerm 
            ? notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
              )
            : notes;
            
        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<p class="empty-state">No notes found matching your search.</p>';
            return;
        }
        
        notesList.innerHTML = '';
        
        filteredNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.setAttribute('data-id', note.id);
            
            if (note.id === currentNoteId) {
                noteItem.classList.add('active');
            }
            
            // Get a preview of the content (first 30 characters)
            const contentPreview = note.content.length > 30 
                ? note.content.substring(0, 30) + '...' 
                : note.content;
            
            // Format the date
            const date = new Date(note.updated || note.created);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            noteItem.innerHTML = `
                <h4>${note.title}</h4>
                <p>${contentPreview}</p>
                <small>${formattedDate}</small>
            `;
            
            noteItem.addEventListener('click', () => {
                loadNote(note.id);
            });
            
            notesList.appendChild(noteItem);
        });
    }

    function createNewNote() {
        // Clear inputs
        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        // Reset current note
        currentNoteId = null;
        
        // Update buttons
        saveNoteBtn.disabled = true;
        deleteNoteBtn.disabled = true;
        
        // Remove active class from all note items
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Focus on title input
        noteTitleInput.focus();
    }

    function loadNote(noteId) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const note = notes.find(note => note.id === noteId);
        
        if (!note) return;
        
        // Set current note
        currentNoteId = noteId;
        
        // Update inputs
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        
        // Update buttons
        saveNoteBtn.disabled = true;
        deleteNoteBtn.disabled = false;
        
        // Update active class
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-id') === noteId) {
                item.classList.add('active');
            }
        });
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (!title) {
            alert('Please enter a title for your note.');
            return;
        }
        
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        if (currentNoteId) {
            // Update existing note
            const noteIndex = notes.findIndex(note => note.id === currentNoteId);
            
            if (noteIndex !== -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
                notes[noteIndex].updated = new Date().toISOString();
                
                addActivity('Note Updated', `Updated note: ${title}`);
            }
        } else {
            // Create new note
            const newNote = {
                id: Date.now().toString(),
                title,
                content,
                created: new Date().toISOString()
            };
            
            notes.unshift(newNote);
            currentNoteId = newNote.id;
            
            addActivity('Note Created', `Created note: ${title}`);
        }
        
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Update buttons
        saveNoteBtn.disabled = true;
        deleteNoteBtn.disabled = false;
        
        // Reload notes
        loadNotes(searchNotesInput.value.trim().toLowerCase());
        
        // Update dashboard stats
        updateDashboardStats();
    }

    function deleteNote() {
        if (!currentNoteId) return;
        
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const noteIndex = notes.findIndex(note => note.id === currentNoteId);
        
        if (noteIndex !== -1) {
            const deletedNote = notes[noteIndex];
            notes.splice(noteIndex, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            addActivity('Note Deleted', `Deleted note: ${deletedNote.title}`);
        }
        
        // Clear inputs
        createNewNote();
        
        // Reload notes
        loadNotes(searchNotesInput.value.trim().toLowerCase());
        
        // Update dashboard stats
        updateDashboardStats();
    }
});
