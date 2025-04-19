// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Navigation functionality
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    // Initialize local storage if needed
    initializeLocalStorage();

    // Update dashboard stats
    updateDashboardStats();

    // Handle navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active-section');
                if (section.id === targetSection) {
                    section.classList.add('active-section');
                }
            });
        });
    });

    // Quick action buttons on dashboard
    const quickActionButtons = document.querySelectorAll('[data-action]');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            
            switch (action) {
                case 'create-flashcard':
                    // Navigate to flashcards section and show form
                    navigateToSection('flashcards');
                    document.getElementById('flashcard-form').classList.remove('hidden');
                    break;
                case 'start-timer':
                    // Navigate to timer section
                    navigateToSection('timer');
                    break;
                case 'create-note':
                    // Navigate to notes section
                    navigateToSection('notes');
                    document.getElementById('new-note-btn').click();
                    break;
            }
        });
    });
});

// Helper function to navigate to a section
function navigateToSection(sectionId) {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    // Update active link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Show target section
    sections.forEach(section => {
        section.classList.remove('active-section');
        if (section.id === sectionId) {
            section.classList.add('active-section');
        }
    });
}

// Initialize local storage with default values if needed
function initializeLocalStorage() {
    if (!localStorage.getItem('flashcards')) {
        localStorage.setItem('flashcards', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('sessions')) {
        localStorage.setItem('sessions', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('activity')) {
        localStorage.setItem('activity', JSON.stringify([]));
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    
    // Update stats
    document.querySelector('.stat-value:nth-child(1)').textContent = flashcards.length;
    document.querySelector('.stat-value:nth-child(3)').textContent = sessions.length;
    document.querySelector('.stat-value:nth-child(5)').textContent = notes.length;
    
    // Update recent activity
    updateRecentActivity();
}

// Update recent activity on dashboard
function updateRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    const activities = JSON.parse(localStorage.getItem('activity')) || [];
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No recent activity. Start studying!</p>';
        return;
    }
    
    activityList.innerHTML = '';
    
    // Show the 5 most recent activities
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activity-item');
        
        const date = new Date(activity.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        activityItem.innerHTML = `
            <p><strong>${activity.type}:</strong> ${activity.description}</p>
            <small>${formattedDate}</small>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Add activity to the activity log
function addActivity(type, description) {
    const activities = JSON.parse(localStorage.getItem('activity')) || [];
    
    const newActivity = {
        type,
        description,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    activities.unshift(newActivity);
    
    // Keep only the 20 most recent activities
    if (activities.length > 20) {
        activities.pop();
    }
    
    localStorage.setItem('activity', JSON.stringify(activities));
    
    // Update dashboard if it's visible
    if (document.getElementById('dashboard').classList.contains('active-section')) {
        updateRecentActivity();
    }
}
