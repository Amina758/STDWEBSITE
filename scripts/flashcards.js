// Flashcards functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const newFlashcardBtn = document.getElementById('new-flashcard-btn');
    const flashcardForm = document.getElementById('flashcard-form');
    const createFlashcardForm = document.getElementById('create-flashcard-form');
    const cancelFlashcardBtn = document.getElementById('cancel-flashcard-btn');
    const flashcardsContainer = document.getElementById('flashcards-container');
    const deckSelect = document.getElementById('deck-select');
    const studyModeBtn = document.getElementById('study-mode-btn');
    const studyMode = document.getElementById('study-mode');
    const flipCardBtn = document.getElementById('flip-card-btn');
    const exitStudyModeBtn = document.getElementById('exit-study-mode-btn');
    const studyQuestion = document.getElementById('study-question');
    const studyAnswer = document.getElementById('study-answer');
    const cardFront = document.querySelector('.card-front');
    const cardBack = document.querySelector('.card-back');
    const ratingButtons = document.querySelectorAll('.rating-btn');

    // Load flashcards
    loadFlashcards();
    updateDeckOptions();

    // Event listeners
    newFlashcardBtn.addEventListener('click', () => {
        flashcardForm.classList.remove('hidden');
    });

    cancelFlashcardBtn.addEventListener('click', () => {
        flashcardForm.classList.add('hidden');
        createFlashcardForm.reset();
    });

    createFlashcardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveFlashcard();
    });

    deckSelect.addEventListener('change', () => {
        loadFlashcards(deckSelect.value);
    });

    studyModeBtn.addEventListener('click', () => {
        startStudyMode();
    });

    flipCardBtn.addEventListener('click', () => {
        cardFront.classList.add('hidden');
        cardBack.classList.remove('hidden');
    });

    exitStudyModeBtn.addEventListener('click', () => {
        studyMode.classList.add('hidden');
        cardFront.classList.remove('hidden');
        cardBack.classList.add('hidden');
    });

    ratingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // In a real app, this would update the spaced repetition algorithm
            // For now, just move to the next card
            nextStudyCard();
        });
    });
});

// Load flashcards from local storage
function loadFlashcards(deckFilter = 'all') {
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    // Filter by deck if needed
    const filteredFlashcards = deckFilter === 'all' 
        ? flashcards 
        : flashcards.filter(card => card.deck === deckFilter);
    
    if (filteredFlashcards.length === 0) {
        flashcardsContainer.innerHTML = '<p class="empty-state">No flashcards found. Create your first one!</p>';
        return;
    }
    
    flashcardsContainer.innerHTML = '';
    
    filteredFlashcards.forEach((card, index) => {
        const flashcardElement = document.createElement('div');
        flashcardElement.classList.add('flashcard');
        flashcardElement.setAttribute('data-id', card.id);
        
        flashcardElement.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <p class="flashcard-question">${card.question}</p>
                </div>
                <div class="flashcard-back">
                    <p class="flashcard-answer">${card.answer}</p>
                </div>
            </div>
            <div class="flashcard-deck">${card.deck || 'General'}</div>
        `;
        
        flashcardElement.addEventListener('click', () => {
            flashcardElement.classList.toggle('flipped');
        });
        
        flashcardsContainer.appendChild(flashcardElement);
    });
}

// Save a new flashcard
function saveFlashcard() {
    const questionInput = document.getElementById('flashcard-question');
    const answerInput = document.getElementById('flashcard-answer');
    const deckInput = document.getElementById('flashcard-deck');
    
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    const deck = deckInput.value.trim() || 'General';
    
    if (!question || !answer) {
        alert('Please fill in both question and answer fields.');
        return;
    }
    
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    const newFlashcard = {
        id: Date.now().toString(),
        question,
        answer,
        deck,
        created: new Date().toISOString(),
        lastReviewed: null,
        reviewCount: 0
    };
    
    flashcards.push(newFlashcard);
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    
    // Add activity
    addActivity('Flashcard Created', `Created flashcard in deck: ${deck}`);
    
    // Reset form and hide it
    document.getElementById('create-flashcard-form').reset();
    document.getElementById('flashcard-form').classList.add('hidden');
    
    // Update deck options
    updateDeckOptions();
    
    // Reload flashcards
    loadFlashcards(document.getElementById('deck-select').value);
    
    // Update dashboard stats
    updateDashboardStats();
}

// Update deck options in the select dropdown
function updateDeckOptions() {
    const deckSelect = document.getElementById('deck-select');
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    // Get unique deck names
    const decks = ['all', ...new Set(flashcards.map(card => card.deck || 'General'))];
    
    // Save current selection
    const currentSelection = deckSelect.value;
    
    // Clear options
    deckSelect.innerHTML = '';
    
    // Add options
    decks.forEach(deck => {
        const option = document.createElement('option');
        option.value = deck;
        option.textContent = deck === 'all' ? 'All Flashcards' : deck;
        deckSelect.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (decks.includes(currentSelection)) {
        deckSelect.value = currentSelection;
    }
}

// Start study mode
function startStudyMode() {
    const deckFilter = document.getElementById('deck-select').value;
    const flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    // Filter by deck if needed
    const studyCards = deckFilter === 'all' 
        ? flashcards 
        : flashcards.filter(card => card.deck === deckFilter);
    
    if (studyCards.length === 0) {
        alert('No flashcards available to study.');
        return;
    }
    
    // Shuffle cards
    const shuffledCards = [...studyCards].sort(() => Math.random() - 0.5);
    
    // Store in session storage for the study session
    sessionStorage.setItem('studyCards', JSON.stringify(shuffledCards));
    sessionStorage.setItem('currentCardIndex', '0');
    
    // Show study mode
    document.getElementById('study-mode').classList.remove('hidden');
    
    // Load first card
    loadStudyCard();
    
    // Add activity
    addActivity('Study Session', `Started studying ${studyCards.length} flashcards`);
}

// Load the current study card
function loadStudyCard() {
    const studyCards = JSON.parse(sessionStorage.getItem('studyCards')) || [];
    const currentIndex = parseInt(sessionStorage.getItem('currentCardIndex')) || 0;
    
    if (currentIndex >= studyCards.length) {
        // End of deck
        alert('You have completed all flashcards in this deck!');
        document.getElementById('study-mode').classList.add('hidden');
        document.querySelector('.card-front').classList.remove('hidden');
        document.querySelector('.card-back').classList.add('hidden');
        return;
    }
    
    const currentCard = studyCards[currentIndex];
    
    // Reset card state
    document.querySelector('.card-front').classList.remove('hidden');
    document.querySelector('.card-back').classList.add('hidden');
    
    // Update card content
    document.getElementById('study-question').textContent = currentCard.question;
    document.getElementById('study-answer').textContent = currentCard.answer;
}

// Move to the next study card
function nextStudyCard() {
    const currentIndex = parseInt(sessionStorage.getItem('currentCardIndex')) || 0;
    sessionStorage.setItem('currentCardIndex', (currentIndex + 1).toString());
    
    loadStudyCard();
}
