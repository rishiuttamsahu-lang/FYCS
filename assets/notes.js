// -------------------------------- */
// NOTES MODULE                     */
// -------------------------------- */

// Initialize folders storage
function initializeFolders() {
    if (!localStorage.getItem('folders')) {
        localStorage.setItem('folders', JSON.stringify([]));
    }
}

// Create a new folder within a subject
function createFolder(subject, folderName) {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const newFolder = {
        id: Date.now(),
        subject: subject,
        name: folderName,
        date: new Date().toLocaleDateString()
    };
    folders.push(newFolder);
    localStorage.setItem('folders', JSON.stringify(folders));
    return newFolder;
}

// Get all folders for a specific subject
function getFoldersBySubject(subject) {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    return folders.filter(folder => folder.subject === subject);
}

// Get a specific folder by ID
function getFolderById(folderId) {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    return folders.find(folder => folder.id == folderId);
}

function initializeNotes() {
    if (!localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify([]));
    }
}

// Updated function to create a note with multiple files within a folder
async function createNote(subject, folderId, title, files) {
    return new Promise((resolve, reject) => {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const noteId = Date.now(); // Generate a unique ID for the note group
        
        // Process all files
        const filePromises = Array.from(files).map((file, index) => {
            return new Promise((fileResolve, fileReject) => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const fileData = {
                        id: `${noteId}-${index}`, // Unique ID for each file
                        noteId: noteId, // Reference to the note group
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: event.target.result, // Base64 encoded file
                        uploadOrder: index
                    };
                    fileResolve(fileData);
                };
                reader.onerror = function(error) {
                    fileReject(error);
                };
                reader.readAsDataURL(file); // Read file as base64
            });
        });
        
        // Wait for all files to be processed
        Promise.all(filePromises)
            .then(fileDataArray => {
                // Create the note group
                const newNote = {
                    id: noteId,
                    subject: subject,
                    folderId: folderId, // Reference to the folder
                    title: title,
                    date: new Date().toLocaleDateString(),
                    files: fileDataArray
                };
                notes.push(newNote);
                localStorage.setItem('notes', JSON.stringify(notes));
                resolve(newNote);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function deleteNote(id) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    // Optionally, trigger a UI update if on the manage notes page
    if (window.location.pathname.includes('admin.html')) {
        loadManageNotesTable();
    }
}

// Get notes by folder ID
function loadNotesByFolder(folderId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    return notes.filter(note => note.folderId == folderId);
}

function loadNotesBySubject(subject) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    return notes.filter(note => note.subject === subject);
}

function getAllNotes() {
    return JSON.parse(localStorage.getItem('notes')) || [];
}

// Updated function to generate folder card
function generateFolderCard(folder) {
    const notesCount = loadNotesByFolder(folder.id).length;
    const cardHtml = `
        <div class="note-card glass-block" style="animation: fadeUp 0.6s ease forwards;">
            <h3>${folder.name}</h3>
            <p class="note-date">${folder.date}</p>
            <p class="file-count">${notesCount} note${notesCount !== 1 ? 's' : ''}</p>
            <div class="card-actions">
                <button onclick="viewFolder(${folder.id})" class="neon-button view-pdf-button">Open Folder</button>
            </div>
        </div>
    `;
    return cardHtml;
}

// Updated function to generate note card with file count
function generateNoteCard(note, isAdminView = false) {
    // Ensure the title maintains its original case when displayed
    const fileCount = note.files ? note.files.length : 0;
    const cardHtml = `
        <div class="note-card glass-block" style="animation: fadeUp 0.6s ease forwards;">
            <h3>${note.title}</h3>
            <p class="note-date">${note.date}</p>
            <p class="note-subject">${note.subject}</p>
            <p class="file-count">${fileCount} file${fileCount !== 1 ? 's' : ''}</p>
            <div class="card-actions">
                <button onclick="viewNoteFiles(${note.id})" class="neon-button view-pdf-button">View Files</button>
                ${isAdminView ? `<button onclick="deleteNote(${note.id})" class="neon-button delete-button">Delete</button>` : ''}
            </div>
        </div>
    `;
    return cardHtml;
}

function loadManageNotesTable() {
    const tableBody = document.getElementById('manage-notes-table-body');
    if (!tableBody) return;

    const notes = getAllNotes();
    tableBody.innerHTML = ''; // Clear existing rows

    notes.forEach(note => {
        const fileCount = note.files ? note.files.length : 0;
        const row = tableBody.insertRow();
        // Display title with original case
        row.innerHTML = `
            <td>${note.title}</td>
            <td>${note.subject}</td>
            <td>${note.date}</td>
            <td class="action-buttons">
                <button onclick="viewNoteFiles(${note.id})" class="neon-button">View Files (${fileCount})</button>
                <button onclick="deleteNote(${note.id})" class="neon-button delete-button">Delete</button>
            </td>
        `;
    });
}

// Updated function to open files in new tabs
function openFileInNewTab(base64File) {
    const parts = base64File.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const byteCharacters = atob(parts[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
}

// New function to view all files in a note
function viewNoteFiles(noteId) {
    const notes = getAllNotes();
    const note = notes.find(n => n.id == noteId);
    
    if (!note || !note.files || note.files.length === 0) {
        alert('No files found for this note.');
        return;
    }
    
    // Open each file in a new tab
    note.files.forEach(file => {
        openFileInNewTab(file.url);
    });
}

// Function to generate file card
function generateFileCard(file, noteId, isAdminView = false) {
    // Get file extension for icon
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let icon = '📄'; // Default icon
    
    // Set icons based on file type
    if (['pdf'].includes(fileExtension)) {
        icon = '📚';
    } else if (['doc', 'docx'].includes(fileExtension)) {
        icon = '📝';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
        icon = '🖼️';
    } else if (['txt'].includes(fileExtension)) {
        icon = '📄';
    } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
        icon = '📦';
    }
    
    // Format file size
    const formattedSize = formatFileSize(file.size);
    
    const cardHtml = `
        <div class="note-card glass-block" style="animation: fadeUp 0.6s ease forwards;">
            <h3>${icon} ${file.name}</h3>
            <p class="note-date">${formattedSize}</p>
            <p class="note-subject">From Note ID: ${noteId}</p>
            <div class="card-actions">
                <button onclick="openFileInNewTab('${file.url}')" class="file-card-button view-file-button">View File</button>
                ${isAdminView ? `<button onclick="deleteFileFromNote(${noteId}, '${file.id}')" class="file-card-button delete-file-button">Delete</button>` : ''}
            </div>
        </div>
    `;
    return cardHtml;
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to delete a specific file from a note
function deleteFileFromNote(noteId, fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const noteIndex = notes.findIndex(note => note.id == noteId);
        
        if (noteIndex !== -1) {
            // Find the file index
            const fileIndex = notes[noteIndex].files.findIndex(file => file.id == fileId);
            
            if (fileIndex !== -1) {
                // Remove the file
                notes[noteIndex].files.splice(fileIndex, 1);
                
                // If no files left, delete the entire note
                if (notes[noteIndex].files.length === 0) {
                    notes.splice(noteIndex, 1);
                }
                
                // Save updated notes
                localStorage.setItem('notes', JSON.stringify(notes));
                
                // Reload the folder content if we're on a folder page
                if (window.location.pathname.includes('folder.html')) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const folderId = urlParams.get('id');
                    if (folderId) {
                        // We need to reload the page to reflect changes
                        window.location.reload();
                    }
                }
                
                alert('File deleted successfully!');
            } else {
                alert('File not found.');
            }
        } else {
            alert('Note not found.');
        }
    }
}

// Function to view folder contents
function viewFolder(folderId) {
    // Redirect to folder page
    window.location.href = `../folder.html?id=${folderId}`;
}