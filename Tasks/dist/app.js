class TaskBoard {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'priority';
        this.searchTimeout = null;
        this.lastSearchTime = null;
        this.init();
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    // Load tasks from localStorage
    loadTasksFromLocalStorage() {
        try {
            const saved = localStorage.getItem('tasks');
            if (saved) {
                const tasks = JSON.parse(saved);

                // Convert date strings back to proper format
                tasks.forEach(task => {
                    if (task.createdAt && typeof task.createdAt === 'string') {
                        task.createdDate = new Date(task.createdAt);
                    }
                    if (task.updatedAt && typeof task.updatedAt === 'string') {
                        task.updatedDate = new Date(task.updatedAt);
                    }
                });

                return tasks;
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
        }
        return [];
    }

    // Add a new task
    addTask(taskData) {
        const newTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: taskData.title.trim(),
            status: taskData.status,
            priority: taskData.priority.toString(),
            tags: taskData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            notes: taskData.notes.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validate
        if (!newTask.title) {
            this.showNotification('Please enter a task title');
            return null;
        }

        if (!newTask.status) {
            this.showNotification('Please select a status');
            return null;
        }

        // Add to tasks
        this.tasks.push(newTask);

        // Renumber priorities
        this.renumberPriorities();

        // Save
        this.saveTasks();

        // Render
        this.render();

        // Show notification
        this.showNotification(`Task added: "${newTask.title}"`);

        return newTask;
    }

    // Delete a task
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            this.showNotification('Task not found');
            return;
        }

        if (confirm(`Delete task "${task.title}"?`)) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.filteredTasks = this.tasks.filter(t =>
                this.currentFilter === 'all' ? true : t.tags.includes(this.currentFilter)
            );

            // Renumber priorities
            this.renumberPriorities();

            // Save
            this.saveTasks();

            // Render
            this.render();

            this.showNotification(`Task deleted: "${task.title}"`);
        }
    }

    async init() {
        // Load from localStorage first, then try to fetch from server
        const localTasks = this.loadTasksFromLocalStorage();

        if (localTasks.length > 0) {
            this.tasks = localTasks;
            console.log('Loaded', localTasks.length, 'tasks from localStorage');
        } else {
            await this.loadTasks();
        }

        // Session start summary for continuity
        const taskCount = this.tasks.length;
        const nowTasks = this.tasks.filter(t => t.status === 'now');
        const nextTasks = this.tasks.filter(t => t.status === 'next');
        const onHoldTasks = this.tasks.filter(t => t.status === 'on-hold');
        const doneTasks = this.tasks.filter(t => t.status === 'done');

        const holdSummary = onHoldTasks.map(t => `#${t.priority} ${t.title}`).join(', ');
        const summaryMessage = `Session start: You have ${taskCount} total tasks (${nowTasks.length} Now, ${nextTasks.length} Next, ${onHoldTasks.length} On Hold, ${doneTasks.length} Done). On Hold: ${holdSummary}`;

        console.log(summaryMessage);
        this.showNotification(summaryMessage);

        this.renumberPriorities(); // Renumber tasks on initial load
        this.setupEventListeners();
        this.render();
        this.updateLastUpdated();

        // Initialize with all tasks selected
        this.filteredTasks = [...this.tasks];

        // Initialize timestamps for standalone version
        this.initializeTimestamps();
    }

    async loadTasks() {
        try {
            // Check if we're in standalone mode (embedded tasks)
            if (typeof embeddedTasks !== 'undefined') {
                this.tasks = embeddedTasks.tasks;
                // Convert to proper format if needed
                this.tasks.forEach(task => {
                    if (typeof task.createdAt === 'string') {
                        task.createdDate = new Date(task.createdAt);
                    }
                    if (typeof task.updatedAt === 'string') {
                        task.updatedDate = new Date(task.updatedAt);
                    }
                });
            } else {
                // Fetch from tasks.json
                const response = await fetch('tasks.json');
                const data = await response.json();
                this.tasks = data.tasks;
                
                // Update timestamps to current time for testing
                const now = new Date();
                this.tasks.forEach(task => {
                    if (task.updatedAt === '2026-02-01T15:45:00Z' || task.updatedAt === '2026-02-01T14:20:00Z') {
                        task.updatedAt = now.toISOString();
                    }
                });
            }
            
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to load tasks');
        }
    }

    initializeTimestamps() {
        // Initialize timestamp tracking for standalone version
        this.timestampData = {
            lastUpdated: Date.now(),
            taskTimestamps: {}
        };
        
        // Store original timestamps for relative calculation
        this.tasks.forEach(task => {
            this.timestampData.taskTimestamps[task.id] = {
                originalCreatedAt: new Date(task.createdAt),
                originalUpdatedAt: new Date(task.updatedAt),
                lastAccessed: Date.now()
            };
        });
        
        // Save to localStorage for persistence
        this.saveTimestampData();
    }

    saveTimestampData() {
        try {
            localStorage.setItem('taskBoardTimestamps', JSON.stringify(this.timestampData));
        } catch (error) {
            console.warn('Could not save timestamp data to localStorage:', error);
        }
    }

    loadTimestampData() {
        try {
            const saved = localStorage.getItem('taskBoardTimestamps');
            if (saved) {
                this.timestampData = JSON.parse(saved);
                // Convert date strings back to Date objects
                Object.keys(this.timestampData.taskTimestamps).forEach(taskId => {
                    const task = this.timestampData.taskTimestamps[taskId];
                    task.originalCreatedAt = new Date(task.originalCreatedAt);
                    task.originalUpdatedAt = new Date(task.originalUpdatedAt);
                    task.lastAccessed = new Date(task.lastAccessed);
                });
            }
        } catch (error) {
            console.warn('Could not load timestamp data from localStorage:', error);
        }
    }

    setupEventListeners() {
        // Search functionality with debouncing and highlighting
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 150); // Reduced delay for faster response
            });
        }

        // Tag filter functionality
        const tagChips = document.querySelectorAll('.tag-chip');
        tagChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.handleTagFilter(e.target.dataset.tag, e.target);
            });
        });

        // Sort functionality
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // Add real-time search feedback
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.placeholder = 'Type to search across titles, notes, and tags...';
            });

            searchInput.addEventListener('blur', () => {
                searchInput.placeholder = 'Search tasks...';
            });
        }

        // Archive button
        const archiveButton = document.getElementById('archive-button');
        if (archiveButton) {
            archiveButton.addEventListener('click', () => {
                this.openArchivePopup();
            });
        }

        // Close archive popup
        const archivePopup = document.getElementById('archive-popup');
        if (archivePopup) {
            archivePopup.addEventListener('click', (e) => {
                if (e.target === archivePopup) {
                    this.closeArchivePopup();
                }
            });

            // Close button in popup
            const closeButton = document.getElementById('close-archive-popup');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.closeArchivePopup();
                });
            }

            // Empty archive button
            const emptyArchiveButton = document.getElementById('empty-archive');
            if (emptyArchiveButton) {
                emptyArchiveButton.addEventListener('click', () => {
                    this.emptyArchive();
                });
            }
        }

        // Add task modal handlers
        const addTaskBtn = document.getElementById('add-task-btn');
        const addModal = document.getElementById('add-task-modal');
        const closeAddModal = document.getElementById('close-add-modal');
        const cancelAddTask = document.getElementById('cancel-add-task');
        const saveAddTask = document.getElementById('save-add-task');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.openAddModal();
            });
        }

        if (closeAddModal) {
            closeAddModal.addEventListener('click', () => {
                this.closeAddModal();
            });
        }

        if (cancelAddTask) {
            cancelAddTask.addEventListener('click', () => {
                this.closeAddModal();
            });
        }

        if (addModal) {
            addModal.addEventListener('click', (e) => {
                if (e.target === addModal) {
                    this.closeAddModal();
                }
            });
        }

        if (saveAddTask) {
            saveAddTask.addEventListener('click', () => {
                this.handleAddTaskSubmit();
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const addModal = document.getElementById('add-task-modal');
                if (addModal && !addModal.classList.contains('hidden')) {
                    this.closeAddModal();
                } else {
                    const archivePopup = document.getElementById('archive-popup');
                    if (archivePopup && !archivePopup.classList.contains('hidden')) {
                        this.closeArchivePopup();
                    }
                }
            }
        });
    }

    openAddModal() {
        const addModal = document.getElementById('add-task-modal');
        if (addModal) {
            // Reset form
            document.getElementById('task-title').value = '';
            document.getElementById('task-priority').value = '1';
            document.getElementById('task-tags').value = '';
            document.getElementById('task-notes').value = '';

            addModal.classList.remove('hidden');
            document.getElementById('task-title').focus();
        }
    }

    closeAddModal() {
        const addModal = document.getElementById('add-task-modal');
        if (addModal) {
            addModal.classList.add('hidden');
        }
    }

    handleAddTaskSubmit() {
        const title = document.getElementById('task-title').value.trim();
        const status = document.getElementById('task-status').value;
        const priority = parseInt(document.getElementById('task-priority').value) || 1;
        const tags = document.getElementById('task-tags').value.trim();
        const notes = document.getElementById('task-notes').value.trim();

        if (!title) {
            this.showNotification('Please enter a task title');
            return;
        }

        if (!status) {
            this.showNotification('Please select a status');
            return;
        }

        const taskData = {
            title,
            status,
            priority,
            tags: tags || '',
            notes
        };

        this.addTask(taskData);
        this.closeAddModal();
    }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Escape: Clear search and focus, or close popup
            if (e.key === 'Escape') {
                const archivePopup = document.getElementById('archive-popup');
                if (archivePopup && !archivePopup.classList.contains('hidden')) {
                    this.closeArchivePopup();
                } else {
                    const searchInput = document.getElementById('search');
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.blur();
                        // Trigger search to reset
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
            }
        });

        // Update timestamps periodically
        setInterval(() => {
            this.updateTimestamps();
        }, 30000); // Update every 30 seconds
    }

    updateTimestamps() {
        // Update last accessed time for all tasks
        const now = Date.now();
        Object.keys(this.timestampData.taskTimestamps).forEach(taskId => {
            this.timestampData.taskTimestamps[taskId].lastAccessed = now;
        });
        
        this.timestampData.lastUpdated = now;
        this.saveTimestampData();
        this.render(); // Re-render to update timestamps
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        this.lastSearchTime = Date.now();
        
        // Clear previous highlights
        this.clearHighlights();
        
        if (searchTerm === '') {
            // If search is empty, reset to filtered tasks or all tasks
            if (this.currentFilter === 'all') {
                this.filteredTasks = [...this.tasks];
            } else {
                this.filteredTasks = this.tasks.filter(task => 
                    task.tags.includes(this.currentFilter)
                );
            }
        } else {
            // Search across multiple fields and store highlighted tasks
            this.filteredTasks = this.tasks.filter(task => {
                const matches = task.title.toLowerCase().includes(searchTerm) ||
                    (task.notes && task.notes.toLowerCase().includes(searchTerm)) ||
                    task.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    task.id.toLowerCase().includes(searchTerm);
                
                if (matches) {
                    // Mark task for highlighting
                    task._highlight = true;
                    return true;
                }
                return false;
            });
        }
        
        this.render();
        
        // Show search result count if search is active
        if (searchTerm !== '') {
            this.showSearchResults(this.filteredTasks.length, searchTerm);
            
            // Highlight matching tasks after render
            setTimeout(() => {
                this.highlightMatchingTasks(searchTerm);
            }, 50); // Faster delay
        }
    }

    highlightMatchingTasks(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        
        // Find all task elements and highlight matching ones
        document.querySelectorAll('.task').forEach(taskElement => {
            const taskId = taskElement.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            
            if (task && task._highlight) {
                taskElement.classList.add('highlighted');
                
                // Highlight matching text in the task
                const titleElement = taskElement.querySelector('.task-title');
                const notesElement = taskElement.querySelector('.task-notes');
                
                if (titleElement) {
                    this.highlightText(titleElement, searchTerm);
                }
                
                if (notesElement) {
                    this.highlightText(notesElement, searchTerm);
                }
            }
        });
        
        // Clear highlight markers
        this.tasks.forEach(task => {
            delete task._highlight;
        });
    }

    highlightText(element, searchTerm) {
        const text = element.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = text.replace(regex, '<mark style="background: var(--accent-secondary); color: var(--bg-primary); padding: 1px 2px; border-radius: 2px;">$1</mark>');
        element.innerHTML = highlightedText;
    }

    clearHighlights() {
        // Remove highlight classes
        document.querySelectorAll('.task.highlighted').forEach(task => {
            task.classList.remove('highlighted');
        });
        
        // Remove text highlights
        document.querySelectorAll('.task-title, .task-notes').forEach(element => {
            element.innerHTML = element.textContent;
        });
    }

    handleTagFilter(tag, button) {
        // Update active state
        document.querySelectorAll('.tag-chip').forEach(chip => {
            chip.classList.remove('active');
        });
        button.classList.add('active');

        this.currentFilter = tag;
        
        if (tag === 'all') {
            this.filteredTasks = [...this.tasks];
        } else {
            this.filteredTasks = this.tasks.filter(task => 
                task.tags.includes(tag)
            );
        }
        
        // Clear search when filtering by tags
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.render();
    }

    sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    // Numeric priority: lower number = higher priority
                    const priorityA = parseInt(a.priority) || 999;
                    const priorityB = parseInt(b.priority) || 999;
                    return priorityA - priorityB;
                case 'date-updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
    }

    render() {
        // Apply filters and sorting
        let tasksToRender = this.filteredTasks;
        
        if (this.currentFilter === 'all') {
            tasksToRender = [...this.tasks];
        } else {
            tasksToRender = this.tasks.filter(task => 
                task.tags.includes(this.currentFilter)
            );
        }
        
        tasksToRender = this.sortTasks(tasksToRender);

        // Render each column
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            const status = column.dataset.status;
            const tasksForColumn = tasksToRender.filter(task => task.status === status);
            this.renderColumn(column, tasksForColumn);
        });

        // Update last updated time
        this.updateLastUpdated();

        // Update column headers with counts
        this.updateColumnCounts();
    }

    updateColumnCounts() {
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            const status = column.dataset.status;
            const tasksForColumn = this.filteredTasks.filter(task => task.status === status);
            const taskCount = column.querySelector('.task-count');
            if (taskCount) {
                taskCount.textContent = tasksForColumn.length;
            }
        });
    }

    renderColumn(column, tasks) {
        const tasksList = column.querySelector('.tasks-list');
        
        // Clear existing tasks
        tasksList.innerHTML = '';
        
        // Render tasks
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });

        // Show empty state if no tasks
        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state">No tasks in this column</div>';
        }
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task`;
        taskElement.dataset.taskId = task.id;

        // Get relative timestamps
        const updatedRelative = this.getRelativeTime(task.updatedAt);

        // Get the first tag for header
        const primaryTag = task.tags.length > 0 ? task.tags[0] : 'todo';

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-header-left">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                </div>
                <div class="task-header-right">
                    <span class="task-header-tag">${this.escapeHtml(primaryTag)}</span>
                    <span class="priority-badge">${task.priority}</span>
                    <button class="delete-btn" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="task-content">
                ${task.notes ? `<div class="task-notes">${this.escapeHtml(task.notes)}</div>` : ''}
            </div>
            <div class="task-meta">
                <span class="task-date">
                    <strong>Updated:</strong> ${updatedRelative}
                </span>
            </div>
        `;

        // Add delete handler
        const deleteBtn = taskElement.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(task.id);
            });
        }

        return taskElement;
    }

    getRelativeTime(dateString) {
        const taskTimestampData = this.timestampData?.taskTimestamps;
        
        if (taskTimestampData) {
            // Use standalone mode with persistent timestamps
            const taskId = this.tasks.find(t => t.createdAt === dateString || t.updatedAt === dateString)?.id;
            
            if (taskId && taskTimestampData[taskId]) {
                const timestamp = taskTimestampData[taskId];
                const now = Date.now();
                const timeDiff = now - timestamp.lastAccessed;
                
                // Use original timestamp and adjust for time passed
                const originalDate = dateString.includes('updatedAt') ? 
                    timestamp.originalUpdatedAt : timestamp.originalCreatedAt;
                const adjustedDate = new Date(originalDate.getTime() + timeDiff);
                
                return this.formatDate(adjustedDate);
            }
        }
        
        // Fallback to regular formatting
        return this.formatDate(new Date(dateString));
    }

    formatDate(date) {
        const now = new Date();
        const diffTime = now - date;
        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // < 1 minute
        if (diffSeconds < 60) {
            return diffSeconds <= 1 ? 'Just now' : `${diffSeconds} seconds ago`;
        }

        // < 1 hour
        if (diffMinutes < 60) {
            const minutes = diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
            return `${minutes} ago`;
        }

        // < 24 hours (NOT showing "Yesterday" until 24 hours elapsed)
        if (diffHours < 24) {
            const hours = diffHours === 1 ? '1 hour' : `${diffHours} hours`;
            return `${hours} ago`;
        }

        // < 7 days
        if (diffDays < 7) {
            const days = diffDays === 1 ? '1 day' : `${diffDays} days`;
            return `${days} ago`;
        }

        // Older: Show short date (e.g., "Feb 2, 2026")
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('last-updated-text');
        if (!lastUpdatedElement) return;
        
        // Find the most recent update from all tasks
        const latestUpdate = this.tasks.reduce((latest, task) => {
            const taskDate = new Date(task.updatedAt);
            const latestDate = new Date(latest);
            return taskDate > latestDate ? task.updatedAt : latest;
        }, '1970-01-01T00:00:00Z');
        
        if (latestUpdate !== '1970-01-01T00:00:00Z') {
            const relativeTime = this.getRelativeTime(latestUpdate);
            lastUpdatedElement.textContent = `Last updated: ${relativeTime}`;
        }
    }

    showSearchResults(count, searchTerm) {
        // Remove existing search result indicator
        const existingIndicator = document.querySelector('.search-result-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Add search result indicator
        const indicator = document.createElement('div');
        indicator.className = 'search-result-indicator';
        indicator.textContent = `${count} result${count !== 1 ? 's' : ''} for "${searchTerm}"`;
        document.body.appendChild(indicator);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 200);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.style.opacity = '0';
            setTimeout(() => errorElement.remove(), 200);
        }, 5000);
    }

    // Method to refresh tasks from server
    async refreshTasks() {
        const oldTaskCount = this.tasks.length;
        await this.loadTasks();
        const newTaskCount = this.tasks.length;
        
        if (oldTaskCount !== newTaskCount) {
            this.showNotification(`Tasks refreshed: ${newTaskCount} tasks loaded`);
        }
        
        this.render();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-success);
            color: var(--bg-primary);
            padding: 12px 16px;
            border-radius: var(--border-radius);
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 200);
        }, 3000);
    }

    // Archive methods
    openArchivePopup() {
        const popup = document.getElementById('archive-popup');
        if (popup) {
            popup.classList.remove('hidden');
            this.renderArchiveList();
        }
    }

    closeArchivePopup() {
        const popup = document.getElementById('archive-popup');
        if (popup) {
            popup.classList.add('hidden');
        }
    }

    getArchivedTasks() {
        try {
            const archived = localStorage.getItem('archivedTasks');
            return archived ? JSON.parse(archived) : [];
        } catch (error) {
            console.error('Error loading archived tasks:', error);
            return [];
        }
    }

    saveArchivedTasks(archivedTasks) {
        try {
            localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
            return true;
        } catch (error) {
            console.error('Error saving archived tasks:', error);
            return false;
        }
    }

    archiveFromDone() {
        const doneTasks = this.tasks.filter(task => task.status === 'done');
        if (doneTasks.length === 0) {
            this.showNotification('No tasks in Done column to archive');
            return;
        }

        const archivedTasks = this.getArchivedTasks();
        const archivedAt = new Date().toISOString();

        doneTasks.forEach(task => {
            archivedTasks.push({
                ...task,
                archivedAt: archivedAt,
                originalStatus: task.status
            });
        });

        if (this.saveArchivedTasks(archivedTasks)) {
            // Remove done tasks from main list
            this.tasks = this.tasks.filter(task => task.status !== 'done');
            this.filteredTasks = this.tasks;
            this.renumberPriorities(); // Renumber remaining tasks
            this.render();
            this.showNotification(`Archived ${doneTasks.length} tasks`);
            this.renderArchiveList();
        } else {
            this.showNotification('Failed to archive tasks');
        }
    }

    restoreTask(archivedTaskIndex) {
        const archivedTasks = this.getArchivedTasks();
        const task = archivedTasks[archivedTaskIndex];

        if (task) {
            // Restore task to done column
            const restoredTask = {
                ...task,
                status: 'done',
                updatedAt: new Date().toISOString()
            };

            // Remove archivedAt and originalStatus properties
            delete restoredTask.archivedAt;
            delete restoredTask.originalStatus;

            this.tasks.push(restoredTask);
            archivedTasks.splice(archivedTaskIndex, 1);

            if (this.saveArchivedTasks(archivedTasks)) {
                this.filteredTasks = this.tasks;
                this.render();
                this.showNotification('Task restored to Done column');
                this.renderArchiveList();
            }
        }
    }

    deleteArchivedTask(archivedTaskIndex) {
        const archivedTasks = this.getArchivedTasks();
        archivedTasks.splice(archivedTaskIndex, 1);

        if (this.saveArchivedTasks(archivedTasks)) {
            this.showNotification('Task deleted from archive');
            this.renderArchiveList();
        }
    }

    emptyArchive() {
        const archivedTasks = this.getArchivedTasks();
        if (archivedTasks.length === 0) {
            this.showNotification('Archive is already empty');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${archivedTasks.length} archived tasks?`)) {
            localStorage.removeItem('archivedTasks');
            this.showNotification('Archive emptied');
            this.renderArchiveList();
        }
    }

    renumberPriorities() {
        // Renumber tasks to maintain sequential order (1, 2, 3...)
        // Sort by current priority (ascending), then assign new priorities
        const sortedTasks = [...this.tasks].sort((a, b) => {
            const priorityA = parseInt(a.priority) || 999;
            const priorityB = parseInt(b.priority) || 999;
            return priorityA - priorityB;
        });

        sortedTasks.forEach((task, index) => {
            task.priority = (index + 1).toString();
        });

        this.saveTasks();
    }

    renderArchiveList() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        const archivedTasks = this.getArchivedTasks();

        if (archivedTasks.length === 0) {
            archiveList.innerHTML = '<div class="archive-empty">No archived tasks</div>';
            return;
        }

        archiveList.innerHTML = archivedTasks.map((task, index) => {
            const archivedAt = this.formatDate(new Date(task.archivedAt));
            return `
                <div class="archive-item">
                    <div class="archive-item-content">
                        <div class="archive-item-title">${this.escapeHtml(task.title)}</div>
                        <div class="archive-item-meta">
                            <span class="archive-priority">#${task.priority}</span>
                            <span class="archive-date">Archived: ${archivedAt}</span>
                        </div>
                    </div>
                    <div class="archive-item-actions">
                        <button class="archive-action restore" onclick="window.taskBoard.restoreTask(${index})">Restore</button>
                        <button class="archive-action delete" onclick="window.taskBoard.deleteArchivedTask(${index})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize the task board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load timestamp data for persistence
    window.taskBoard = new TaskBoard();
    window.taskBoard.loadTimestampData();
    
    // Add periodic refresh (optional - every 5 minutes)
    setInterval(() => {
        const board = window.taskBoard;
        if (board) {
            board.refreshTasks();
        }
    }, 5 * 60 * 1000); // 5 minutes
});