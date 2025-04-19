// Timer functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    const longBreakDurationInput = document.getElementById('long-break-duration');
    const sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
    const sessionList = document.getElementById('session-list');

    // Timer variables
    let timer;
    let isRunning = false;
    let isPaused = false;
    let timeLeft = workDurationInput.value * 60;
    let currentMode = 'work';
    let sessionsCompleted = 0;

    // Load session history
    loadSessionHistory();

    // Event listeners
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Settings inputs
    workDurationInput.addEventListener('change', () => {
        if (!isRunning) {
            timeLeft = workDurationInput.value * 60;
            updateTimerDisplay();
        }
    });

    // Functions
    function startTimer() {
        if (isPaused) {
            isPaused = false;
        } else if (!isRunning) {
            isRunning = true;
            
            // Add activity
            if (currentMode === 'work') {
                addActivity('Timer', 'Started a work session');
            }
        }
        
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        
        timer = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                
                // Play notification sound
                playNotificationSound();
                
                if (currentMode === 'work') {
                    // Work session completed
                    sessionsCompleted++;
                    saveSession('work');
                    
                    // Check if it's time for a long break
                    if (sessionsCompleted % parseInt(sessionsBeforeLongBreakInput.value) === 0) {
                        currentMode = 'longBreak';
                        timeLeft = parseInt(longBreakDurationInput.value) * 60;
                        alert('Work session completed! Time for a long break.');
                        addActivity('Timer', 'Completed work session, started long break');
                    } else {
                        currentMode = 'break';
                        timeLeft = parseInt(breakDurationInput.value) * 60;
                        alert('Work session completed! Time for a short break.');
                        addActivity('Timer', 'Completed work session, started short break');
                    }
                } else {
                    // Break completed
                    saveSession(currentMode);
                    currentMode = 'work';
                    timeLeft = parseInt(workDurationInput.value) * 60;
                    
                    if (currentMode === 'longBreak') {
                        alert('Long break completed! Ready to work again?');
                        addActivity('Timer', 'Completed long break, started work session');
                    } else {
                        alert('Break completed! Ready to work again?');
                        addActivity('Timer', 'Completed short break, started work session');
                    }
                }
                
                updateTimerDisplay();
                isRunning = false;
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timer);
        isPaused = true;
        isRunning = false;
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        
        addActivity('Timer', 'Paused the timer');
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        currentMode = 'work';
        timeLeft = parseInt(workDurationInput.value) * 60;
        updateTimerDisplay();
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        
        addActivity('Timer', 'Reset the timer');
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update document title
        document.title = `(${minutes}:${seconds.toString().padStart(2, '0')}) StudyBuddy`;
    }

    function saveSession(type) {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        
        let duration;
        if (type === 'work') {
            duration = parseInt(workDurationInput.value);
        } else if (type === 'break') {
            duration = parseInt(breakDurationInput.value);
        } else {
            duration = parseInt(longBreakDurationInput.value);
        }
        
        const newSession = {
            id: Date.now().toString(),
            type,
            duration,
            timestamp: new Date().toISOString()
        };
        
        sessions.unshift(newSession);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        // Update session history
        loadSessionHistory();
        
        // Update dashboard stats
        updateDashboardStats();
    }

    function loadSessionHistory() {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        
        if (sessions.length === 0) {
            sessionList.innerHTML = '<p class="empty-state">No sessions completed yet.</p>';
            return;
        }
        
        sessionList.innerHTML = '';
        
        // Show the 10 most recent sessions
        sessions.slice(0, 10).forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.classList.add('session-item');
            
            const date = new Date(session.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            let sessionType;
            if (session.type === 'work') {
                sessionType = 'Work Session';
            } else if (session.type === 'break') {
                sessionType = 'Short Break';
            } else {
                sessionType = 'Long Break';
            }
            
            sessionItem.innerHTML = `
                <div>
                    <strong>${sessionType}</strong>
                    <div>${formattedDate}</div>
                </div>
                <div>${session.duration} minutes</div>
            `;
            
            sessionList.appendChild(sessionItem);
        });
    }

    function playNotificationSound() {
        // Create an audio element
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        audio.play().catch(error => {
            console.log('Audio playback failed:', error);
        });
    }

    // Initialize timer display
    updateTimerDisplay();
});
