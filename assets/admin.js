// Admin Panel Enhancements

// Global variables for pagination
let currentPage = 1;
let notesPerPage = 10;
let allNotes = [];
let filteredNotes = [];


// Allowed file types
const allowedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
];

// Show loader
function showLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    if (loader) {
        loader.style.display = 'block';
    }
}

// Hide loader
function hideLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    if (loader) {
        loader.style.display = 'none';
    }
}

// Dashboard functions
function updateDashboardStats() {
    const notes = getAllNotes();
    
    // Total notes
    document.getElementById('total-notes').textContent = notes.length;
    
    // Unique subjects
    const subjects = [...new Set(notes.map(note => note.subject))];
    document.getElementById('total-subjects').textContent = subjects.length;
    
    // Uploads this month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const uploadsThisMonth = notes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate.getMonth() === thisMonth && noteDate.getFullYear() === thisYear;
    }).length;
    
    document.getElementById('uploads-month').textContent = uploadsThisMonth;
    
    // Most active subject
    const subjectCounts = {};
    notes.forEach(note => {
        subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
    });
    
    let mostActiveSubject = '-';
    let maxCount = 0;
    for (const [subject, count] of Object.entries(subjectCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostActiveSubject = subject;
        }
    }
    
    document.getElementById('most-active-subject').textContent = mostActiveSubject;
    
    // Recent uploads (last 5)
    const recentNotes = [...notes].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }).slice(0, 5);
    
    const recentUploadsList = document.getElementById('recent-uploads-list');
    recentUploadsList.innerHTML = '';
    
    if (recentNotes.length === 0) {
        recentUploadsList.innerHTML = '<p>No recent uploads</p>';
        return;
    }
    
    const list = document.createElement('ul');
    recentNotes.forEach(note => {
        const item = document.createElement('li');
        item.textContent = `${note.title} (${note.subject}) - ${note.date}`;
        list.appendChild(item);
    });
    
    recentUploadsList.appendChild(list);
    
    // Update system info
    updateSystemInfo(notes);
}

// New function to update system information
function updateSystemInfo(notes) {
    // Total folders
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    document.getElementById('total-folders').textContent = folders.length;
    
    // Storage estimation (simplified)
    let totalSize = 0;
    notes.forEach(note => {
        if (note.files) {
            note.files.forEach(file => {
                // Extract size from base64 string (approximate)
                if (file.url) {
                    // Rough estimation: base64 is about 33% larger than original
                    const base64Length = file.url.length;
                    totalSize += (base64Length * 0.75) / (1024 * 1024); // Convert to MB
                }
            });
        }
    });
    
    document.getElementById('storage-used').textContent = totalSize.toFixed(2) + ' MB';
    
    // Last login (simplified - using current date)
    const lastLogin = localStorage.getItem('lastLogin') || new Date().toLocaleDateString();
    document.getElementById('last-login').textContent = lastLogin;
}
// Form validation
function validateUploadForm() {
    let isValid = true;
    
    // Clear previous errors
    document.getElementById('subject-error').textContent = '';
    document.getElementById('title-error').textContent = '';
    document.getElementById('file-error').textContent = '';
    
    // Validate subject
    const subject = document.getElementById('subject-select').value;
    if (!subject) {
        document.getElementById('subject-error').textContent = 'Please select a subject';
        isValid = false;
    }
    
    // Validate title
    const title = document.getElementById('note-title').value.trim();
    if (!title) {
        document.getElementById('title-error').textContent = 'Please enter a title';
        isValid = false;
    }
    
    // Validate files
    const fileInput = document.getElementById('note-files');
    const files = fileInput.files;
    if (files.length === 0) {
        document.getElementById('file-error').textContent = 'Please select at least one file';
        isValid = false;
    } else {
        // Check file types and sizes
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check file type
            if (!allowedFileTypes.includes(file.type)) {
                document.getElementById('file-error').textContent = `Invalid file type for ${file.name}. Please select valid file types (PDF, DOCX, JPG, PNG, GIF)`;
                isValid = false;
                break;
            }
            
            // Check file size (50MB limit per file)
            if (file.size > 50 * 1024 * 1024) {
                document.getElementById('file-error').textContent = `File ${file.name} exceeds 50MB limit`;
                isValid = false;
                break;
            }
        }
    }
    
    return isValid;
}

// File Preview
function setupFilePreview() {
    const fileInput = document.getElementById('note-files');
    const previewContainer = document.getElementById('preview-container');
    const pdfPreview = document.getElementById('pdf-preview');
    const fileList = document.getElementById('file-list');
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            // Display file list with drag-and-drop reordering
            displayFileListWithReordering(files);
            
            // Preview first file if it's PDF or image
            const firstFile = files[0];
            if (firstFile.type === 'application/pdf') {
                const fileURL = URL.createObjectURL(firstFile);
                pdfPreview.src = fileURL;
                pdfPreview.style.display = 'block';
                previewContainer.style.display = 'block';
            } else if (firstFile.type.startsWith('image/')) {
                const fileURL = URL.createObjectFile(firstFile);
                pdfPreview.src = fileURL; 
                pdfPreview.style.display = 'block';
                previewContainer.style.display = 'block';
            } else {
                previewContainer.style.display = 'none';
            }
        } else {
            fileList.innerHTML = '';
            previewContainer.style.display = 'none';
        }
    });
}

// Display file list with drag-and-drop reordering capability
function displayFileListWithReordering(files) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    // Convert FileList to array to maintain order
    const filesArray = Array.from(files);
    
    // Add instruction text
    const instruction = document.createElement('div');
    instruction.className = 'reorder-instructions';
    instruction.textContent = 'Drag and drop to reorder files';
    fileList.appendChild(instruction);
    
    // Add each file as a draggable item
    filesArray.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.draggable = true;
        fileItem.dataset.index = index;
        
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <span>(${formatFileSize(file.size)})</span>
            <div class="file-item-actions">
                <button type="button" class="move-up" title="Move up">↑</button>
                <button type="button" class="move-down" title="Move down">↓</button>
                <button type="button" class="remove-file" title="Remove file">×</button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    // Setup drag and drop events
    setupFileReordering();
    
    // Setup button events
    setupFileActionButtons(filesArray);
}

// Setup drag and drop events for file reordering
function setupFileReordering() {
    const fileList = document.getElementById('file-list');
    const fileItems = fileList.querySelectorAll('.file-item:not(.reorder-instructions)');
    
    let draggedItem = null;
    
    fileItems.forEach(item => {
        // Drag start
        item.addEventListener('dragstart', function() {
            draggedItem = this;
            setTimeout(() => this.classList.add('dragging'), 0);
        });
        
        // Drag end
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedItem = null;
            updateFileInputOrder();
        });
        
        // Drag over
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        // Drag enter
        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        // Drag leave
        item.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        // Drop
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (draggedItem !== this) {
                const allItems = Array.from(fileList.querySelectorAll('.file-item:not(.reorder-instructions)'));
                const draggedIndex = allItems.indexOf(draggedItem);
                const targetIndex = allItems.indexOf(this);
                
                if (draggedIndex < targetIndex) {
                    this.parentNode.insertBefore(draggedItem, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(draggedItem, this);
                }
                
                updateFileInputOrder();
            }
        });
    });
}

// Setup button events for file actions (move up, move down, remove)
function setupFileActionButtons(filesArray) {
    const fileList = document.getElementById('file-list');
    
    // Move up buttons
    fileList.querySelectorAll('.move-up').forEach((button, index) => {
        button.addEventListener('click', function() {
            if (index > 0) {
                const fileItems = fileList.querySelectorAll('.file-item:not(.reorder-instructions)');
                const currentItem = fileItems[index];
                const previousItem = fileItems[index - 1];
                fileList.insertBefore(currentItem, previousItem);
                updateFileInputOrder();
            }
        });
    });
    
    // Move down buttons
    fileList.querySelectorAll('.move-down').forEach((button, index) => {
        button.addEventListener('click', function() {
            const fileItems = fileList.querySelectorAll('.file-item:not(.reorder-instructions)');
            if (index < fileItems.length - 1) {
                const currentItem = fileItems[index];
                const nextItem = fileItems[index + 1];
                fileList.insertBefore(nextItem, currentItem);
                updateFileInputOrder();
            }
        });
    });
    
    // Remove file buttons
    fileList.querySelectorAll('.remove-file').forEach((button, index) => {
        button.addEventListener('click', function() {
            const fileItems = fileList.querySelectorAll('.file-item:not(.reorder-instructions)');
            const currentItem = fileItems[index];
            fileList.removeChild(currentItem);
            updateFileInputOrder();
        });
    });
}

// Update the file input order based on the current display order
function updateFileInputOrder() {
    const fileInput = document.getElementById('note-files');
    const fileList = document.getElementById('file-list');
    const fileItems = fileList.querySelectorAll('.file-item:not(.reorder-instructions)');
    
    // Create a new DataTransfer object to hold reordered files
    const dataTransfer = new DataTransfer();
    
    // Get the original files from the input
    const originalFiles = Array.from(fileInput.files);
    
    // Add files in the new order
    fileItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        if (index >= 0 && index < originalFiles.length) {
            dataTransfer.items.add(originalFiles[index]);
        }
    });
    
    // Update the file input
    fileInput.files = dataTransfer.files;
    
    // Trigger change event to update preview
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Drag and drop functionality
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('note-files');
    const fileList = document.getElementById('file-list');
    
    // DOM elements for UI updates
    const dropIcon = dropZone.querySelector('.drop-icon');
    const dropContent = dropZone.querySelector('.drop-content');
    const fileError = document.getElementById('file-error');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection via standard input click
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            updateDropZoneUI(this.files);
            // Display file list with reordering capability
            displayFileListWithReordering(this.files);
        }
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const newFiles = dt.files;

        if (newFiles.length) {
            // Get existing files
            const existingFiles = fileInput.files;
            
            // Create a new DataTransfer object to hold all files
            const dataTransfer = new DataTransfer();
            
            // Add existing files first
            for (let i = 0; i < existingFiles.length; i++) {
                dataTransfer.items.add(existingFiles[i]);
            }
            
            // Add new dropped files
            for (let i = 0; i < newFiles.length; i++) {
                dataTransfer.items.add(newFiles[i]);
            }
            
            // Update the file input with combined files
            fileInput.files = dataTransfer.files;

            // Trigger change event to update preview and validations
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            // UI Update
            updateDropZoneUI(fileInput.files);
        }
    }    
    function updateDropZoneUI(files) {
        dropZone.classList.add('has-file');
        
        // Change Icon to a document style
        dropIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        
        // Update text
        if (files.length === 1) {
            dropContent.innerHTML = `
                <p class="primary-text" style="color: #4CAF50;">${files[0].name}</p>
                <p class="secondary-text">Click to change file</p>
            `;
        } else {
            dropContent.innerHTML = `
                <p class="primary-text" style="color: #4CAF50;">${files.length} files selected</p>
                <p class="secondary-text">Click to change files</p>
            `;
        }
    }
}

// Manage Notes functions
function filterAndSortNotes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    const filterSubject = document.getElementById('filter-subject').value;
    
    let result = [...allNotes];
    
    // Apply search filter
    if (searchTerm) {
        result = result.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.subject.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply subject filter
    if (filterSubject !== 'all') {
        result = result.filter(note => note.subject === filterSubject);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    filteredNotes = result;
    renderNotesTable();
}

function renderNotesTable() {
    const tableBody = document.getElementById('manage-notes-table-body');
    if (!tableBody) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * notesPerPage;
    const endIndex = startIndex + notesPerPage;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);
    
    // Render notes
    tableBody.innerHTML = '';
    
    if (paginatedNotes.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="4" style="text-align: center;">No notes found</td>';
        updatePagination();
        return;
    }
    
    paginatedNotes.forEach(note => {
        const fileCount = note.files ? note.files.length : 0;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${note.title}</td>
            <td>${note.subject}</td>
            <td>${note.date}</td>
            <td class="action-buttons">
                <button onclick="viewNoteFiles(${note.id})" class="neon-button">View Files (${fileCount})</button>
                <button onclick="deleteNoteDirectly(${note.id})" class="neon-button delete-button">Delete</button>
            </td>
        `;
    });
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
    
    document.getElementById('current-page').textContent = currentPage;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

function deleteNoteDirectly(noteId) {
    deleteNote(noteId);
    // Refresh the table
    loadManageNotesTable();
}





// Folder Management Functions

// Initialize folders
function initializeFolders() {
    if (!localStorage.getItem('folders')) {
        localStorage.setItem('folders', JSON.stringify([]));
    }
}

// Create a new folder
function createFolder(subject, folderName) {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const newFolder = {
        id: folders.length > 0 ? Math.max(...folders.map(folder => folder.id)) + 1 : 1,
        subject: subject,
        name: folderName,
        date: new Date().toLocaleDateString()
    };
    folders.push(newFolder);
    localStorage.setItem('folders', JSON.stringify(folders));
    return newFolder;
}

// Load notes by folder
function loadNotesByFolder(folderId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    return notes.filter(note => note.folderId == folderId);
}

// Add a new folder within a subject
function addFolder() {
    const subject = document.getElementById('folder-subject').value;
    const folderName = document.getElementById('folder-name').value.trim();
    const errorMessage = document.getElementById('folder-name-error');
    const successMessage = document.getElementById('folder-action-message');
    
    // Clear messages
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    // Validate input
    if (!subject) {
        errorMessage.textContent = 'Please select a subject';
        return;
    }
    
    if (!folderName) {
        errorMessage.textContent = 'Please enter a folder name';
        return;
    }
    
    // Create the folder
    try {
        createFolder(subject, folderName);
        
        // Clear form
        document.getElementById('add-folder-form').reset();
        
        // Show success message
        successMessage.textContent = 'Folder created successfully!';
        successMessage.style.color = 'green';
        
        // Reload folders if on folders section
        if (document.getElementById('folders')) {
            loadFoldersTable();
        }
    } catch (error) {
        errorMessage.textContent = 'Error creating folder: ' + error.message;
    }
}

// Load folders into the table
function loadFoldersTable() {
    const tableBody = document.getElementById('folders-table-body');
    if (!tableBody) return;
    
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    tableBody.innerHTML = '';
    
    if (folders.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="3" style="text-align: center;">No folders found</td>';
        return;
    }
    
    folders.forEach((folder, index) => {
        const notesCount = loadNotesByFolder(folder.id).length;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${folder.name}</td>
            <td>${folder.subject}</td>
            <td>${notesCount} notes</td>
            <td class="action-buttons">
                <button class="neon-button" onclick="viewFolder(${folder.id})">View</button>
                <button class="neon-button delete-button" onclick="deleteFolder(${folder.id})">Delete</button>
            </td>
        `;
    });
}

// Delete a folder
function deleteFolder(folderId) {
    if (confirm('Are you sure you want to delete this folder? All notes in this folder will also be deleted.')) {
        // Delete all notes in this folder
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes = notes.filter(note => note.folderId != folderId);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Delete the folder
        let folders = JSON.parse(localStorage.getItem('folders')) || [];
        folders = folders.filter(folder => folder.id != folderId);
        localStorage.setItem('folders', JSON.stringify(folders));
        
        // Reload folders table
        loadFoldersTable();
    }
}

// View folder contents
function viewFolder(folderId) {
    // Redirect to folder management page or show folder contents
    alert('Viewing folder with ID: ' + folderId);
}

// Update the upload form to include folder selection
function updateFolderDropdowns() {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const folderSelect = document.getElementById('note-folder');
    
    if (folderSelect) {
        // Store the current selection
        const currentValue = folderSelect.value;
        
        // Clear existing options except the first one
        while (folderSelect.children.length > 1) {
            folderSelect.removeChild(folderSelect.lastChild);
        }
        
        // Add folders to dropdown
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = `${folder.subject} - ${folder.name}`;
            folderSelect.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && folders.some(f => f.id == currentValue)) {
            folderSelect.value = currentValue;
        }
    }
}

// Update folder dropdown based on selected subject
function updateFolderDropdown(subject) {
    const folderSelect = document.getElementById('note-folder');
    if (!folderSelect) return;
    
    // Clear existing options except the first one
    while (folderSelect.children.length > 1) {
        folderSelect.removeChild(folderSelect.lastChild);
    }
    
    // Get folders for the selected subject
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const subjectFolders = folders.filter(folder => folder.subject === subject);
    
    // Add folders to dropdown
    subjectFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
    });
    
    // Disable dropdown if no folders exist
    folderSelect.disabled = subjectFolders.length === 0;
    if (subjectFolders.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No folders available - Create one first';
        folderSelect.appendChild(option);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Dashboard stats
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        updateDashboardStats();
    }
    
    // Upload form enhancements
    const uploadForm = document.getElementById('upload-note-form');
    if (uploadForm) {
        // Setup file preview
        setupFilePreview();
        
        // Setup drag and drop
        setupDragAndDrop();
        
        // Real-time validation
        document.getElementById('subject-select').addEventListener('change', validateUploadForm);
        document.getElementById('note-title').addEventListener('input', validateUploadForm);
        document.getElementById('note-files').addEventListener('change', validateUploadForm);
        
        // Form submission logic is handled in admin.html directly as per user code structure,
        // but we ensure drag-and-drop updates visual state correctly so standard submit works.
    }
    
    // Populate subject dropdowns
    const subjects = getAllSubjects();
    updateSubjectDropdowns(subjects);
    
    // Manage notes enhancements
    const manageSection = document.getElementById('manage');
    if (manageSection) {
        // Load notes
        allNotes = getAllNotes();
        filteredNotes = [...allNotes];
        
        // Setup search and filters
        document.getElementById('search-input').addEventListener('input', () => {
            currentPage = 1;
            filterAndSortNotes();
        });
        
        document.getElementById('sort-by').addEventListener('change', () => {
            currentPage = 1;
            filterAndSortNotes();
        });
        
        document.getElementById('filter-subject').addEventListener('change', () => {
            currentPage = 1;
            filterAndSortNotes();
        });
        
        // Setup pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderNotesTable();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderNotesTable();
            }
        });
        
        // Initial render
        renderNotesTable();
    }
    

    
    // Subject Management
    const subjectsSection = document.getElementById('subjects');
    if (subjectsSection) {
        loadSubjectsTable();
        
        // Add subject form
        document.getElementById('add-subject-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addSubject();
        });
    }
    
    // Card Manager
    const cardsSection = document.getElementById('cards');
    if (cardsSection) {
        loadCardsList();
        
        // Add card form
        document.getElementById('add-card-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addCard();
        });
    }
    
    // Initialize folders
    initializeFolders();
    
    // Update folder dropdowns
    updateFolderDropdowns();
    
    // Folder Management
    const foldersSection = document.getElementById('folders');
    if (foldersSection) {
        loadFoldersTable();
        
        // Add folder form
        document.getElementById('add-folder-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addFolder();
        });
    }
    
    // Mobile menu toggle
    setupMobileMenu();
});

// Mobile menu toggle function
function setupMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.createElement('button');
    menuToggle.innerHTML = '☰';
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    
    // Always add the toggle button, but control visibility with CSS
    sidebar.parentNode.insertBefore(menuToggle, sidebar);
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('slide-out');
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('slide-out');
        }
    });
    
    // Initial check
    if (window.innerWidth <= 768) {
        sidebar.classList.add('slide-out');
    }
}

// Subject Management Functions

// Get all subjects from localStorage
function getAllSubjects() {
    let subjects = localStorage.getItem('subjects');
    return subjects ? JSON.parse(subjects) : [
        'oop', 'cc', 'algo', 'minor', 'mm2', 'evs', 'hrm', 'hindi',
        'python', 'oop-practical', 'algo-practical', 'webdev', 'extra-material'
    ];
}

// Save subjects to localStorage
function saveSubjects(subjects) {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

// Card Management Functions

// Get all cards from localStorage
function getAllCards() {
    let cards = localStorage.getItem('cards');
    if (cards) {
        return JSON.parse(cards);
    } else {
        // Default cards
        return [
            { id: 1, title: 'OOP', url: 'subjects/oop.html', category: 'theory' },
            { id: 2, title: 'Co-Cirriculum', url: 'subjects/cc.html', category: 'theory' },
            { id: 3, title: 'Algorithms', url: 'subjects/algo.html', category: 'theory' },
            { id: 4, title: 'Maths Project', url: 'subjects/minor.html', category: 'theory' },
            { id: 5, title: 'MM-II', url: 'subjects/mm2.html', category: 'theory' },
            { id: 6, title: 'EVS', url: 'subjects/evs.html', category: 'theory' },
            { id: 7, title: 'HRM', url: 'subjects/hrm.html', category: 'theory' },
            { id: 8, title: 'Hindi', url: 'subjects/hindi.html', category: 'theory' },
            { id: 9, title: 'Python', url: 'practical-notes/python.html', category: 'practical' },
            { id: 10, title: 'OOP Practical', url: 'practical-notes/oop-practical.html', category: 'practical' },
            { id: 11, title: 'Algorithms Practical', url: 'practical-notes/algo-practical.html', category: 'practical' },
            { id: 12, title: 'Web Development', url: 'practical-notes/webdev.html', category: 'practical' },
            { id: 13, title: 'Extra Material', url: 'practical-notes/extra-material.html', category: 'extra' }
        ];
    }
}

// Save cards to localStorage
function saveCards(cards) {
    localStorage.setItem('cards', JSON.stringify(cards));
}

// Add a new card
function addCard() {
    const cardTitle = document.getElementById('card-title').value.trim();
    const cardUrl = document.getElementById('card-url').value.trim();
    const cardCategory = document.getElementById('card-category').value;
    const titleError = document.getElementById('card-title-error');
    const urlError = document.getElementById('card-url-error');
    const successMessage = document.getElementById('card-action-message');
    
    // Clear messages
    titleError.textContent = '';
    urlError.textContent = '';
    successMessage.textContent = '';
    
    // Validate input
    if (!cardTitle) {
        titleError.textContent = 'Please enter a card title';
        return;
    }
    
    if (!cardUrl) {
        urlError.textContent = 'Please enter a card URL';
        return;
    }
    
    // Get existing cards
    let cards = getAllCards();
    
    // Generate new ID
    const newId = cards.length > 0 ? Math.max(...cards.map(card => card.id)) + 1 : 1;
    
    // Create new card object
    const newCard = {
        id: newId,
        title: cardTitle,
        url: cardUrl,
        category: cardCategory
    };
    
    // Add to cards array
    cards.push(newCard);
    
    // Save to localStorage
    saveCards(cards);
    
    // Reset form
    document.getElementById('add-card-form').reset();
    
    // Show success message
    successMessage.textContent = 'Card added successfully!';
    
    // Refresh cards list
    loadCardsList();
    
    // Update index.html
    updateIndexPage();
}

// Delete a card
function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        let cards = getAllCards();
        cards = cards.filter(card => card.id !== cardId);
        saveCards(cards);
        loadCardsList();
        updateIndexPage();
    }
}

// Edit a card
function editCard(cardId) {
    const cards = getAllCards();
    const card = cards.find(c => c.id === cardId);
    
    if (card) {
        const newTitle = prompt('Enter new title:', card.title);
        const newUrl = prompt('Enter new URL:', card.url);
        const newCategory = prompt('Enter new category (theory/practical/extra):', card.category);
        
        if (newTitle !== null && newUrl !== null && newCategory !== null) {
            card.title = newTitle;
            card.url = newUrl;
            card.category = newCategory;
            
            saveCards(cards);
            loadCardsList();
            updateIndexPage();
        }
    }
}

// Load cards list in admin panel
function loadCardsList() {
    const cardsTableBody = document.getElementById('cards-table-body');
    const cards = getAllCards();
    
    if (cards.length === 0) {
        cardsTableBody.innerHTML = '<tr><td colspan="4">No cards found.</td></tr>';
        return;
    }
    
    let cardsHTML = '';
    
    cards.forEach(card => {
        cardsHTML += `
            <tr>
                <td>${card.title}</td>
                <td>${card.url}</td>
                <td>${card.category}</td>
                <td>
                    <button class="neon-button small" onclick="editCard(${card.id})">Edit</button>
                    <button class="neon-button small delete-note-button" onclick="deleteCard(${card.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    cardsTableBody.innerHTML = cardsHTML;
}

// Update index.html with current cards
function updateIndexPage() {
    // Get all cards
    const cards = getAllCards();
    
    // Separate theory, practical, and extra material cards
    const theoryCards = cards.filter(card => card.category === 'theory');
    const practicalCards = cards.filter(card => card.category === 'practical');
    const extraMaterielCards = cards.filter(card => card.category === 'extra');
    
    // Update theory section
    const theoryGrid = document.getElementById('theory-cards-container');
    if (theoryGrid) {
        theoryGrid.innerHTML = '';
        theoryCards.forEach(card => {
            const cardElement = document.createElement('a');
            cardElement.href = card.url;
            cardElement.className = 'subject-card glass-block';
            cardElement.innerHTML = `<h3>${card.title}</h3>`;
            theoryGrid.appendChild(cardElement);
        });
    }
    
    // Update practical section
    const practicalGrid = document.getElementById('practical-cards-container');
    if (practicalGrid) {
        practicalGrid.innerHTML = '';
        practicalCards.forEach(card => {
            const cardElement = document.createElement('a');
            cardElement.href = card.url;
            cardElement.className = 'subject-card glass-block';
            cardElement.innerHTML = `<h3>${card.title}</h3>`;
            practicalGrid.appendChild(cardElement);
        });
    }
    
    // Update extra material section
    const extraMaterialGrid = document.getElementById('extra-material-container');
    if (extraMaterialGrid) {
        extraMaterialGrid.innerHTML = '';
        extraMaterielCards.forEach(card => {
            const cardElement = document.createElement('a');
            cardElement.href = card.url;
            cardElement.className = 'subject-card glass-block';
            cardElement.innerHTML = `<h3>${card.title}</h3>`;
            extraMaterialGrid.appendChild(cardElement);
        });
    }
}

// Add a new subject
function addSubject() {
    const subjectName = document.getElementById('subject-name').value.trim();
    const subjectCategory = document.getElementById('subject-category').value;
    const errorMessage = document.getElementById('subject-name-error');
    const successMessage = document.getElementById('subject-action-message');
    
    // Clear messages
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    // Validate input
    if (!subjectName) {
        errorMessage.textContent = 'Please enter a subject name';
        return;
    }
    
    // Get existing subjects
    let subjects = getAllSubjects();
    
    // Check for duplicates (case insensitive)
    if (subjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) {
        errorMessage.textContent = 'Subject already exists';
        return;
    }
    
    // Add new subject
    const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');
    subjects.push(subjectSlug);
    saveSubjects(subjects);
    
    // Update categorized subjects
    const categorizedSubjects = getCategorizedSubjects();
    
    // Add to the selected category
    if (subjectCategory === 'theory') {
        categorizedSubjects.theory.push(subjectSlug);
    } else if (subjectCategory === 'practical') {
        categorizedSubjects.practical.push(subjectSlug);
    } else {
        // Handle extra category
        if (!categorizedSubjects.extra) {
            categorizedSubjects.extra = [];
        }
        categorizedSubjects.extra.push(subjectSlug);
    }
    
    saveCategorizedSubjects(categorizedSubjects);
    
    // Clear form
    document.getElementById('add-subject-form').reset();
    
    // Show success message
    successMessage.textContent = 'Subject added successfully!';
    successMessage.style.color = 'green';
    
    // Reload subjects table
    loadSubjectsTable();
    
    // Update subject dropdowns across the site
    updateSubjectDropdowns(subjects);
}

// Load subjects into the table
function loadSubjectsTable() {
    const tableBody = document.getElementById('subjects-table-body');
    if (!tableBody) return;
    
    const subjects = getAllSubjects();
    tableBody.innerHTML = '';
    
    if (subjects.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = '<td colspan="2" style="text-align: center;">No subjects found</td>';
        return;
    }
    
    const categorizedSubjects = getCategorizedSubjects();
    
    subjects.forEach((subject, index) => {
        // Determine category
        let category = 'Theory';
        if (categorizedSubjects.practical.includes(subject)) {
            category = 'Practical';
        } else if (categorizedSubjects.extra && categorizedSubjects.extra.includes(subject)) {
            category = 'Extra';
        }
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>
                <span class="subject-name-display">${subject}</span>
                <input type="text" class="subject-name-edit" value="${subject}" style="display: none; width: 100%; padding: 5px;" />
            </td>
            <td>
                <select class="category-select" data-index="${index}" data-original="${category}" style="display: none;">
                    <option value="Theory" ${category === 'Theory' ? 'selected' : ''}>Theory</option>
                    <option value="Practical" ${category === 'Practical' ? 'selected' : ''}>Practical</option>
                    <option value="Extra" ${category === 'Extra' ? 'selected' : ''}>Extra</option>
                </select>
                <span class="category-display">${category}</span>
            </td>
            <td class="action-buttons">
                <button class="neon-button edit-subject-btn" data-index="${index}" data-original="${subject}">Edit</button>
                <button class="neon-button delete-button delete-subject-btn" data-index="${index}" data-subject="${subject}">Delete</button>
                <button class="neon-button save-subject-btn" data-index="${index}" style="display: none;">Save</button>
                <button class="neon-button cancel-subject-btn" data-index="${index}" data-original="${subject}" style="display: none;">Cancel</button>
            </td>
        `;
    });
    
    // Add event listeners for edit, delete, save, and cancel buttons
    document.querySelectorAll('.edit-subject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const originalName = this.getAttribute('data-original');
            enableSubjectEdit(index, originalName);
        });
    });
    
    document.querySelectorAll('.delete-subject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const subjectName = this.getAttribute('data-subject');
            deleteSubject(index, subjectName);
        });
    });
    
    document.querySelectorAll('.save-subject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            saveSubjectEdit(index);
        });
    });
    
    document.querySelectorAll('.cancel-subject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const originalName = this.getAttribute('data-original');
            cancelSubjectEdit(index, originalName);
        });
    });
}

// Enable editing for a subject
function enableSubjectEdit(index, originalName) {
    const row = document.querySelector(`.edit-subject-btn[data-index="${index}"]`).closest('tr');
    const displayName = row.querySelector('.subject-name-display');
    const editInput = row.querySelector('.subject-name-edit');
    const categoryDisplay = row.querySelector('.category-display');
    const categorySelect = row.querySelector('.category-select');
    const editBtn = row.querySelector('.edit-subject-btn');
    const deleteBtn = row.querySelector('.delete-subject-btn');
    const saveBtn = row.querySelector('.save-subject-btn');
    const cancelBtn = row.querySelector('.cancel-subject-btn');
    
    // Switch to edit mode
    displayName.style.display = 'none';
    editInput.style.display = 'block';
    categoryDisplay.style.display = 'none';
    categorySelect.style.display = 'block';
    editBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    
    // Focus the input
    editInput.focus();
}

// Save edited subject
function saveSubjectEdit(index) {
    const row = document.querySelector(`.save-subject-btn[data-index="${index}"]`).closest('tr');
    const editInput = row.querySelector('.subject-name-edit');
    const categorySelect = row.querySelector('.category-select');
    const newName = editInput.value.trim();
    const newCategory = categorySelect.value;
    const originalName = row.querySelector('.cancel-subject-btn').getAttribute('data-original');
    
    if (!newName) {
        alert('Subject name cannot be empty');
        return;
    }
    
    // Get subjects
    let subjects = getAllSubjects();
    
    // Check for duplicates (excluding the current subject)
    const newSlug = newName.toLowerCase().replace(/\s+/g, '-');
    if (newSlug.toLowerCase() !== originalName.toLowerCase() && 
        subjects.some(s => s.toLowerCase() === newSlug.toLowerCase())) {
        alert('A subject with this name already exists');
        return;
    }
    
    // Update subject
    subjects[index] = newSlug;
    saveSubjects(subjects);
    
    // Update categorized subjects
    const categorizedSubjects = getCategorizedSubjects();
    
    // Remove from both categories
    const theoryIndex = categorizedSubjects.theory.indexOf(originalName);
    if (theoryIndex !== -1) {
        categorizedSubjects.theory.splice(theoryIndex, 1);
    }
    
    const practicalIndex = categorizedSubjects.practical.indexOf(originalName);
    if (practicalIndex !== -1) {
        categorizedSubjects.practical.splice(practicalIndex, 1);
    }
    
    // Remove from extra category if it exists
    if (categorizedSubjects.extra) {
        const extraIndex = categorizedSubjects.extra.indexOf(originalName);
        if (extraIndex !== -1) {
            categorizedSubjects.extra.splice(extraIndex, 1);
        }
    }
    
    // Add to the selected category
    if (newCategory === 'Theory') {
        categorizedSubjects.theory.push(newSlug);
    } else if (newCategory === 'Practical') {
        categorizedSubjects.practical.push(newSlug);
    } else {
        // Handle Extra category
        if (!categorizedSubjects.extra) {
            categorizedSubjects.extra = [];
        }
        categorizedSubjects.extra.push(newSlug);
    }
    
    saveCategorizedSubjects(categorizedSubjects);
    
    // Reload table
    loadSubjectsTable();
    
    // Update subject dropdowns across the site
    updateSubjectDropdowns(subjects);
}

// Cancel subject edit
function cancelSubjectEdit(index, originalName) {
    const row = document.querySelector(`.cancel-subject-btn[data-index="${index}"]`).closest('tr');
    const displayName = row.querySelector('.subject-name-display');
    const editInput = row.querySelector('.subject-name-edit');
    const categoryDisplay = row.querySelector('.category-display');
    const categorySelect = row.querySelector('.category-select');
    const editBtn = row.querySelector('.edit-subject-btn');
    const deleteBtn = row.querySelector('.delete-subject-btn');
    const saveBtn = row.querySelector('.save-subject-btn');
    const cancelBtn = row.querySelector('.cancel-subject-btn');
    
    // Revert to display mode
    displayName.style.display = 'inline';
    editInput.style.display = 'none';
    categoryDisplay.style.display = 'inline';
    categorySelect.style.display = 'none';
    editBtn.style.display = 'inline-block';
    deleteBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // Reset input value
    editInput.value = originalName;
}

// Delete a subject
function deleteSubject(index, subjectName) {
    if (confirm(`Are you sure you want to delete the subject "${subjectName}"? This will not affect existing notes with this subject.`)) {
        // Get subjects
        let subjects = getAllSubjects();
        
        // Remove subject
        subjects.splice(index, 1);
        saveSubjects(subjects);
        
        // Update categorized subjects
        const categorizedSubjects = getCategorizedSubjects();
        
        // Remove from theory category
        const theoryIndex = categorizedSubjects.theory.indexOf(subjectName);
        if (theoryIndex !== -1) {
            categorizedSubjects.theory.splice(theoryIndex, 1);
        }
        
        // Remove from practical category
        const practicalIndex = categorizedSubjects.practical.indexOf(subjectName);
        if (practicalIndex !== -1) {
            categorizedSubjects.practical.splice(practicalIndex, 1);
        }
        
        // Remove from extra category if it exists
        if (categorizedSubjects.extra) {
            const extraIndex = categorizedSubjects.extra.indexOf(subjectName);
            if (extraIndex !== -1) {
                categorizedSubjects.extra.splice(extraIndex, 1);
            }
        }
        
        saveCategorizedSubjects(categorizedSubjects);
        
        // Reload table
        loadSubjectsTable();
        
        // Update subject dropdowns across the site
        updateSubjectDropdowns(subjects);
    }
}

// Update subject dropdowns across the site
function updateSubjectDropdowns(subjects) {
    // Get categorized subjects from localStorage or use defaults
    const categorizedSubjects = getCategorizedSubjects();
    
    // Update upload form subject dropdown
    const subjectSelect = document.getElementById('subject-select');
    if (subjectSelect) {
        // Store the current selection
        const currentValue = subjectSelect.value;
        
        // Clear existing options except the first one
        while (subjectSelect.children.length > 1) {
            subjectSelect.removeChild(subjectSelect.lastChild);
        }
        
        // Add theory subjects
        const theoryGroup = document.createElement('optgroup');
        theoryGroup.label = 'Theory';
        
        // Add practical subjects
        const practicalGroup = document.createElement('optgroup');
        practicalGroup.label = 'Practical';
        
        // Add extra material subjects
        const extraMaterialGroup = document.createElement('optgroup');
        extraMaterialGroup.label = 'Extra Material';
        
        // Categorize subjects
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ');
            
            // Check if subject is categorized as practical
            if (categorizedSubjects.practical.includes(subject)) {
                // Check if it's the extra-material subject
                if (subject === 'extra-material') {
                    extraMaterialGroup.appendChild(option);
                } else {
                    practicalGroup.appendChild(option);
                }
            } else {
                theoryGroup.appendChild(option);
            }
        });
        
        // Add groups to select
        if (theoryGroup.children.length > 0) {
            subjectSelect.appendChild(theoryGroup);
        }
        if (practicalGroup.children.length > 0) {
            subjectSelect.appendChild(practicalGroup);
        }
        if (extraMaterialGroup.children.length > 0) {
            subjectSelect.appendChild(extraMaterialGroup);
        }
        
        // Restore selection if it still exists
        if (currentValue && subjects.includes(currentValue)) {
            subjectSelect.value = currentValue;
        }
    }
    
    // Update manage notes filter dropdown
    const filterSubject = document.getElementById('filter-subject');
    if (filterSubject) {
        // Store the current selection
        const currentValue = filterSubject.value;
        
        // Clear existing options except the first one
        while (filterSubject.children.length > 1) {
            filterSubject.removeChild(filterSubject.lastChild);
        }
        
        // Add subjects to filter
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ');
            filterSubject.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && (currentValue === 'all' || subjects.includes(currentValue))) {
            filterSubject.value = currentValue;
        }
    }
    
    // Update index.html subject grids
    updateIndexPageSubjects(subjects, categorizedSubjects);
}

// Get categorized subjects from localStorage
function getCategorizedSubjects() {
    const stored = localStorage.getItem('categorizedSubjects');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default categorization
    return {
        theory: ['oop', 'cc', 'algo', 'minor', 'mm2', 'evs', 'hrm', 'hindi'],
        practical: ['python', 'oop-practical', 'algo-practical', 'webdev'],
        extra: ['extra-material']
    };
}

// Save categorized subjects to localStorage
function saveCategorizedSubjects(categorizedSubjects) {
    localStorage.setItem('categorizedSubjects', JSON.stringify(categorizedSubjects));
}

// Update index.html subject grids
function updateIndexPageSubjects(subjects, categorizedSubjects) {
    // Update theory subjects grid
    const theoryGrid = document.querySelector('#theory-subjects .subject-grid');
    if (theoryGrid) {
        theoryGrid.innerHTML = '';
        categorizedSubjects.theory.forEach(subject => {
            if (subjects.includes(subject)) {
                const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ');
                const subjectLink = subject.replace(/\s+/g, '-').toLowerCase();
                const subjectCard = document.createElement('a');
                subjectCard.href = subject.includes('practical') ? `practical-notes/${subjectLink}.html` : `subjects/${subjectLink}.html`;
                subjectCard.className = 'subject-card glass-block';
                subjectCard.innerHTML = `<h3>${subjectName}</h3>`;
                theoryGrid.appendChild(subjectCard);
            }
        });
    }
    
    // Update practical subjects grid
    const practicalGrid = document.querySelector('#practical-notes .subject-grid');
    if (practicalGrid) {
        practicalGrid.innerHTML = '';
        categorizedSubjects.practical.forEach(subject => {
            if (subjects.includes(subject)) {
                const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ');
                const subjectLink = subject.replace(/\s+/g, '-').toLowerCase();
                const subjectCard = document.createElement('a');
                subjectCard.href = `practical-notes/${subjectLink}.html`;
                subjectCard.className = 'subject-card glass-block';
                subjectCard.innerHTML = `<h3>${subjectName}</h3>`;
                practicalGrid.appendChild(subjectCard);
            }
        });
    }
    
    // Update extra material grid
    const extraMaterialGrid = document.querySelector('#extra-material .subject-grid');
    if (extraMaterialGrid) {
        extraMaterialGrid.innerHTML = '';
        if (categorizedSubjects.extra) {
            categorizedSubjects.extra.forEach(subject => {
                if (subjects.includes(subject)) {
                    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, ' ');
                    const subjectLink = subject.replace(/\s+/g, '-').toLowerCase();
                    const subjectCard = document.createElement('a');
                    subjectCard.href = `practical-notes/${subjectLink}.html`;
                    subjectCard.className = 'subject-card glass-block';
                    subjectCard.innerHTML = `<h3>${subjectName}</h3>`;
                    extraMaterialGrid.appendChild(subjectCard);
                }
            });
        }
    }
}