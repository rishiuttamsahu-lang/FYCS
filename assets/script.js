// -------------------------------- */
// GLOBAL SCRIPT                    */
// -------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication and UI on all pages
    initializeAuth();
    updateUserUI();

    // Specific logic for subject pages
    const notesContainer = document.querySelector('.notes-container');
    if (notesContainer) {
        const pathParts = window.location.pathname.split('/');
        const fileName = pathParts.pop();
        const subject = fileName.split('.')[0];
        
        let allNotes = loadNotesBySubject(subject); // Load all notes for the subject
        renderNotes(allNotes, notesContainer);

        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredNotes = allNotes.filter(note =>
                    note.title.toLowerCase().includes(searchTerm) ||
                    note.subject.toLowerCase().includes(searchTerm)
                );
                // Pass the original notes with preserved case to render function
                renderNotes(filteredNotes, notesContainer);
            });
        }
    }
});

function renderNotes(notesToRender, container) {
    container.innerHTML = '';
    if (notesToRender.length === 0) {
        container.innerHTML = '<p>No notes available for this subject yet.</p>';
        return;
    }
    notesToRender.forEach(note => {
        // Use the original note title with preserved case
        container.innerHTML += generateNoteCard(note, isAdmin());
    });
}

function loadNotesForSubjectPage(subject) {
    const notesContainer = document.querySelector('.notes-container');
    if (!notesContainer) return;

    notesContainer.innerHTML = ''; // Clear existing notes
    const notes = loadNotesBySubject(subject); // From notes.js

    if (notes.length === 0) {
        notesContainer.innerHTML = '<p>No notes available for this subject yet.</p>';
        return;
    }

    notes.forEach(note => {
        // Use the original note title with preserved case
        notesContainer.innerHTML += generateNoteCard(note, isAdmin()); // From notes.js, pass isAdmin for delete button
    });
}