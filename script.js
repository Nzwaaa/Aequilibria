// State management
let isLoggedIn = false;
let currentUser = null;
let currentJournal = null;
let journalHistory = [];
let currentMonth = new Date().getMonth(); // Current month (0-indexed)
let currentYear = new Date().getFullYear();
const emotionLabels = ["Anxiety", "Depression", "Stress", "Neutral", "Happiness", "Excitement"];
let emotionChartInstance; // To hold the Chart.js instance

// DOM Elements
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const journalSection = document.getElementById('journalSection');
const statisticsSection = document.getElementById('statisticsSection');
const historySection = document.getElementById('historySection');
const heroSection = document.getElementById('heroSection');
const resultsDiv = document.getElementById('results');
const noResultsDiv = document.getElementById('noResults');
const loadingDiv = document.getElementById('loading');
const sentimentResultDiv = document.getElementById('sentimentResult');
const dominantEmotionsDiv = document.getElementById('dominantEmotions');
const keyInsightsDiv = document.getElementById('keyInsights');
const historyGrid = document.getElementById('historyGrid');
const sentimentPointer = document.getElementById('sentimentPointer');
const sentimentValueLabel = document.getElementById('sentimentValueLabel');
const musicRecommendationsDiv = document.getElementById('musicRecommendations');
const calendarDays = document.getElementById('calendarDays');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateEl = document.getElementById('selectedDate');
const dateInput = document.getElementById('date');
const emotionChartCanvas = document.getElementById('emotionChart');
const commonEmotionEl = document.getElementById('commonEmotion');
const stabilityScoreEl = document.getElementById('stabilityScore');
const streakCountEl = document.getElementById('streakCount');
const navLinks = document.querySelectorAll('.nav-menu a');

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    setupEventListeners();
    
    // Add animations to elements when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card, .vision-card, .history-card, .stats-card, .form-card, .result-card').forEach(el => {
        observer.observe(el);
    });
});

function initUI() {
    updateAuthUI();
    noResultsDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    loadJournalHistory();
    renderCalendar(currentYear, currentMonth);
    // Set today as default selected date on load
    const today = new Date();
    setSelectedDate(today);
    renderEmotionChart();
    calculateStatistics();
    showSection('heroSection'); // Ensure hero section is visible on initial load
}

// --- Navigation and Section Visibility ---

function showSection(sectionId) {
    const sections = [heroSection, journalSection, statisticsSection, historySection];
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    // Special handling for sections that need re-rendering or calculations
    if (sectionId === 'statisticsSection') {
        renderEmotionChart();
        calculateStatistics();
    } else if (sectionId === 'historySection') {
        renderJournalHistory();
    } else if (sectionId === 'journalSection') {
        renderCalendar(currentYear, currentMonth);
        // Ensure the current journal entry is displayed if a date is already selected
        const selectedDateVal = dateInput.value;
        if (selectedDateVal) {
            const entry = journalHistory.find(entry => entry.date === selectedDateVal);
            if (entry) {
                document.getElementById('journal').value = entry.journal;
                displayAnalysis(entry);
            } else {
                document.getElementById('journal').value = '';
                noResultsDiv.style.display = 'block';
                resultsDiv.style.display = 'none';
            }
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active state in nav menu
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

// --- Authentication Modals ---

function openModal(type) {
    document.getElementById(`${type}Modal`).style.display = 'flex'; // Use flex to center
}

function closeModal(type) {
    document.getElementById(`${type}Modal`).style.display = 'none';
}

function switchModal(from, to) {
    closeModal(from);
    openModal(to);
}

function updateAuthUI() {
    if (isLoggedIn) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    updateAuthUI();
    alert('You have been logged out!');
    showSection('heroSection'); // Go back to home after logout
}

// --- Event Listeners ---

function setupEventListeners() {
    // Nav menu links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Simulate login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        isLoggedIn = true;
        currentUser = {
            name: 'Sarah', // In a real app, this would come from backend
            email: document.getElementById('loginEmail').value
        };
        updateAuthUI();
        closeModal('login');
        alert('Login successful!');
    });

    // Simulate registration
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        isLoggedIn = true;
        currentUser = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value
        };
        updateAuthUI();
        closeModal('register');
        alert('Account created successfully!');
    });

    // Journal form submission
    document.getElementById('journalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        loadingDiv.style.display = 'block';
        noResultsDiv.style.display = 'none';
        resultsDiv.style.display = 'none';
        
        // Simulate API call
        setTimeout(analyzeJournal, 1500);
    });

    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });
}

// --- Calendar Functions ---

function renderCalendar(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarDays.innerHTML = ''; // Clear existing days
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty'; // Added 'empty' class
        calendarDays.appendChild(emptyCell);
    }
    
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthActual = today.getMonth();
    const currentYearActual = today.getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const fullDate = new Date(year, month, day);
        const isoDate = fullDate.toISOString().split('T')[0];

        // Check if this day has an entry
        const hasEntry = journalHistory.some(entry => entry.date === isoDate);
        if (hasEntry) {
            dayCell.classList.add('has-entry');
        }
        
        // Highlight today
        if (day === currentDay && month === currentMonthActual && year === currentYearActual) {
            dayCell.classList.add('selected');
            // If today is the default, set it in the input fields
            if (!dateInput.value) { // Only set if not already set by history
                setSelectedDate(fullDate);
            }
        }
        
        dayCell.addEventListener('click', () => {
            // Remove selected from all days
            document.querySelectorAll('.calendar-day').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected to clicked day
            dayCell.classList.add('selected');
            
            // Update date display and hidden input
            setSelectedDate(fullDate);
            
            // Load journal if exists
            const existingEntry = journalHistory.find(entry => entry.date === isoDate);
            if (existingEntry) {
                document.getElementById('journal').value = existingEntry.journal;
                displayAnalysis(existingEntry);
            } else {
                document.getElementById('journal').value = '';
                noResultsDiv.style.display = 'block';
                resultsDiv.style.display = 'none';
            }
        });
        
        calendarDays.appendChild(dayCell);
    }
}

function setSelectedDate(dateObject) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    selectedDateEl.value = dateObject.toLocaleDateString('en-US', options);
    dateInput.value = dateObject.toISOString().split('T')[0];
}

// --- Journal Analysis and Display ---

function analyzeJournal() {
    const date = dateInput.value;
    const journal = document.getElementById('journal').value;
    
    // Basic validation
    if (!journal.trim()) {
        alert('Please write something in your journal entry before analyzing.');
        loadingDiv.style.display = 'none';
        noResultsDiv.style.display = 'block';
        return;
    }

    // Simulate sentiment analysis
    const sentimentScore = Math.random() * 2 - 1; // Between -1 and 1
    
    // Determine sentiment label and class
    let sentimentLabel = "";
    let sentimentClass = "";
    if (sentimentScore <= -0.75) {
        sentimentLabel = "Very Negative";
        sentimentClass = "very-negative";
    } else if (sentimentScore <= -0.25) {
        sentimentLabel = "Negative";
        sentimentClass = "negative";
    } else if (sentimentScore <= 0.25) {
        sentimentLabel = "Neutral";
        sentimentClass = "neutral";
    } else if (sentimentScore <= 0.75) {
        sentimentLabel = "Positive";
        sentimentClass = "positive";
    } else {
        sentimentLabel = "Very Positive";
        sentimentClass = "very-positive";
    }
    
    // Generate dominant emotions (randomly for demonstration)
    const emotionsPool = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral", "Love", "Calmness", "Excitement", "Anxiety", "Stress"];
    const dominant = [];
    const numDominant = Math.floor(Math.random() * 2) + 2; // 2-3 emotions
    
    // Ensure unique dominant emotions
    const shuffledEmotions = [...emotionsPool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numDominant; i++) {
        dominant.push(shuffledEmotions[i]);
    }
    
    // Generate key insights (randomly for demonstration)
    const insights = [
        "Your entry shows a need for more self-compassion and acceptance.",
        "You're focusing on challenges but also showing resilience.",
        "There's a strong theme of gratitude in your reflections.",
        "You might benefit from setting clearer boundaries.",
        "Your writing indicates a search for meaning and purpose.",
        "Consider exploring activities that bring you joy regularly.",
        "You seem to be handling stress well, but remember to take breaks.",
        "Reflecting on positive moments can enhance your overall mood."
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    // Create current journal object
    currentJournal = {
        date: date,
        sentiment: sentimentScore,
        journal: journal,
        dominantEmotions: dominant,
        keyInsight: randomInsight,
        sentimentLabel: sentimentLabel // Store the label for easier display
    };
    
    displayAnalysis(currentJournal);
}

function displayAnalysis(entry) {
    // Set sentiment result
    sentimentResultDiv.innerHTML = `Sentiment: <span class="sentiment-indicator ${entry.sentimentLabel.toLowerCase().replace(' ', '-')}" style="background-color: ${getSentimentColor(entry.sentiment)}; color: white;">${entry.sentimentLabel}</span>`;
    
    dominantEmotionsDiv.textContent = entry.dominantEmotions.join(", ");
    keyInsightsDiv.textContent = entry.keyInsight;
    
    generateMusicRecommendations(entry.sentiment);
    updateSentimentVisualization(entry.sentiment);
    
    loadingDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    noResultsDiv.style.display = 'none';
    
    // Animate results
    const resultItems = document.querySelectorAll('#results .result-item, #results .sentiment-visualization, #results .btn-primary, #results .btn-outline');
    resultItems.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = 1;
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function getSentimentColor(sentiment) {
    if (sentiment <= -0.75) return '#dc2626'; // Very Negative
    if (sentiment <= -0.25) return '#ea580c'; // Negative
    if (sentiment <= 0.25) return '#2563eb'; // Neutral
    if (sentiment <= 0.75) return '#16a34a'; // Positive
    return '#0d9488'; // Very Positive
}

function generateMusicRecommendations(sentiment) {
    musicRecommendationsDiv.innerHTML = '';
    
    let musicData = [];
    
    if (sentiment < -0.5) {
        // Very negative sentiment
        musicData = [
            { title: "Calm Meditation", artist: "Peaceful Minds", icon: "fas fa-spa", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { title: "Healing Piano", artist: "Serenity Sounds", icon: "fas fa-music", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { title: "Nature Sounds", artist: "Forest Whisper", icon: "fas fa-tree", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
        ];
    } else if (sentiment < 0) {
        // Negative sentiment
        musicData = [
            { title: "Uplifting Melodies", artist: "Hope Ensemble", icon: "fas fa-sun", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
            { title: "Gentle Guitar", artist: "Acoustic Harmony", icon: "fas fa-guitar", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
            { title: "Soothing Strings", artist: "String Serenity", icon: "fas fa-violin", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
        ];
    } else if (sentiment < 0.5) {
        // Neutral sentiment
        musicData = [
            { title: "Focus Flow", artist: "Concentration Crew", icon: "fas fa-brain", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
            { title: "Ambient Atmosphere", artist: "Atmospheric Sounds", icon: "fas fa-cloud", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
            { title: "Chill Beats", artist: "Relaxation Radio", icon: "fas fa-wind", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" }
        ];
    } else {
        // Positive sentiment
        musicData = [
            { title: "Happy Tunes", artist: "Joy Collective", icon: "fas fa-smile", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
            { title: "Upbeat Energy", artist: "Vibrant Vibes", icon: "fas fa-bolt", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
            { title: "Celebration Mix", artist: "Party Playlist", icon: "fas fa-glass-cheers", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" }
        ];
    }
    
    musicData.forEach(music => {
        const musicCard = document.createElement('div');
        musicCard.className = 'music-card';
        const audioId = `audio-${Math.random().toString(36).substr(2, 9)}`;
        
        musicCard.innerHTML = `
            <div class="music-image">
                <i class="${music.icon}"></i>
            </div>
            <div class="music-content">
                <div class="music-title">${music.title}</div>
                <div class="music-artist">${music.artist}</div>
                <button class="play-btn" onclick="playAudio('${audioId}', this)">
                    <i class="fas fa-play"></i> Play
                </button>
                <audio id="${audioId}" src="${music.audio}"></audio>
            </div>
        `;
        
        musicRecommendationsDiv.appendChild(musicCard);
    });
}

function playAudio(id, button) {
    const audio = document.getElementById(id);
    
    // Pause all other audios
    document.querySelectorAll('audio').forEach(otherAudio => {
        if (otherAudio !== audio && !otherAudio.paused) {
            otherAudio.pause();
            otherAudio.previousElementSibling.innerHTML = '<i class="fas fa-play"></i> Play';
        }
    });

    if (audio.paused) {
        audio.play();
        button.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
        audio.pause();
        button.innerHTML = '<i class="fas fa-play"></i> Play';
    }

    // Reset button text when audio ends
    audio.onended = () => {
        button.innerHTML = '<i class="fas fa-play"></i> Play';
    };
}

function updateSentimentVisualization(sentiment) {
    // Normalize sentiment from -1 to 1 to 0 to 100 for pointer position
    const normalizedSentiment = (sentiment + 1) / 2; // Converts -1 to 0, 0 to 0.5, 1 to 1
    let position = normalizedSentiment * 100;
    
    sentimentPointer.style.left = `calc(${position}% - 15px)`; // Adjust for pointer width
    
    let sentimentLabel = "";
    if (sentiment <= -0.75) sentimentLabel = "Very Negative";
    else if (sentiment <= -0.25) sentimentLabel = "Negative";
    else if (sentiment <= 0.25) sentimentLabel = "Neutral";
    else if (sentiment <= 0.75) sentimentLabel = "Positive";
    else sentimentLabel = "Very Positive";
    
    sentimentValueLabel.textContent = `Sentiment: ${sentimentLabel}`;
    sentimentValueLabel.style.left = `${position}%`; // Keep label centered with pointer
}

// --- Journal History Management ---

function saveJournal() {
    if (!currentJournal) {
        alert('No journal entry to save. Please analyze an entry first.');
        return;
    }
    
    // Check if an entry for this date already exists and update it
    const existingIndex = journalHistory.findIndex(entry => entry.date === currentJournal.date);
    if (existingIndex !== -1) {
        journalHistory[existingIndex] = currentJournal;
        alert('Journal entry updated successfully!');
    } else {
        journalHistory.push(currentJournal);
        alert('Journal entry saved successfully!');
    }
    
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
    
    // Re-render calendar and history to reflect changes
    renderCalendar(currentYear, currentMonth);
    renderJournalHistory();
}

function loadJournalHistory() {
    const savedHistory = localStorage.getItem('journalHistory');
    if (savedHistory) {
        journalHistory = JSON.parse(savedHistory);
    }
    // Ensure journalHistory is always an array
    if (!Array.isArray(journalHistory)) {
        journalHistory = [];
    }
    // Sort by date (newest first)
    journalHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderJournalHistory();
}

function renderJournalHistory() {
    historyGrid.innerHTML = '';
    
    if (journalHistory.length === 0) {
        historyGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray);">
                <div style="font-size: 4em; margin-bottom: 20px;"><i class="fas fa-book"></i></div>
                <h3>No journal entries yet</h3>
                <p>Start journaling to track your emotional journey</p>
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="showSection('journalSection')">
                    <i class="fas fa-book-open"></i> Start Journaling
                </button>
            </div>
        `;
        return;
    }
    
    journalHistory.forEach((entry, index) => {
        const historyCard = document.createElement('div');
        historyCard.className = 'history-card fade-in';
        historyCard.style.animationDelay = `${index * 0.1}s`; // Staggered animation
        
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let sentimentStatus = entry.sentimentLabel;
        let statusColor = getSentimentColor(entry.sentiment); // Use the helper function
        
        const truncatedJournal = entry.journal.length > 100 ? 
            entry.journal.substring(0, 100) + '...' : entry.journal;
        
        historyCard.innerHTML = `
            <div class="history-date">
                <i class="far fa-calendar"></i> ${formattedDate}
            </div>
            <h3 class="history-title">Journal Entry</h3>
            <p style="color: var(--gray); margin-bottom: 15px; font-style: italic;">"${truncatedJournal}"</p>
            <div class="history-stats">
                <div class="stat-item">
                    <span class="stat-label">Sentiment</span>
                    <span class="stat-value" style="color: ${statusColor}">${sentimentStatus}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Emotions</span>
                    <span class="stat-value">${entry.dominantEmotions.join(', ')}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="action-btn view-btn" onclick="viewJournalDetail('${entry.date}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="action-btn delete-btn" onclick="deleteJournal('${entry.date}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        historyGrid.appendChild(historyCard);
    });
}

function deleteJournal(dateToDelete) {
    if (confirm('Are you sure you want to delete this journal entry?')) {
        journalHistory = journalHistory.filter(entry => entry.date !== dateToDelete);
        localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
        renderJournalHistory();
        renderCalendar(currentYear, currentMonth); // Update calendar dots
        alert('Journal entry deleted.');
    }
}

function viewJournalDetail(dateToView) {
    const entry = journalHistory.find(entry => entry.date === dateToView);
    if (!entry) {
        alert('Entry not found!');
        return;
    }
    currentJournal = entry; // Set the current journal for potential saving
    
    // Set form values
    const entryDate = new Date(entry.date);
    setSelectedDate(entryDate); // Use helper function
    document.getElementById('journal').value = entry.journal;
    
    // Update calendar selection
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
    const dayToSelect = new Date(dateToView).getDate();
    const monthToSelect = new Date(dateToView).getMonth();
    const yearToSelect = new Date(dateToView).getFullYear();
    if (monthToSelect !== currentMonth || yearToSelect !== currentYear) {
        currentMonth = monthToSelect;
        currentYear = yearToSelect;
        renderCalendar(currentYear, currentMonth);
    }
    // Find and select the day after rendering (or re-rendering) the calendar
    const dayCells = calendarDays.querySelectorAll('.calendar-day');
    Array.from(dayCells).find(cell => parseInt(cell.textContent) === dayToSelect && !cell.classList.contains('empty'))?.classList.add('selected');


    // Display analysis results
    displayAnalysis(entry);
    
    // Show journal section
    showSection('journalSection');
}

// --- Statistics Functions ---

function renderEmotionChart() {
    if (emotionChartInstance) {
        emotionChartInstance.destroy(); // Destroy previous chart instance
    }

    const ctx = emotionChartCanvas.getContext('2d');
    
    // Prepare data for chart (last 7 entries)
    const last7Entries = journalHistory.slice(0, 7).reverse(); // Get most recent 7, and reverse to show chronologically
    const dates = last7Entries.map(entry => {
        const date = new Date(entry.date);
        return `${date.getDate()}/${date.getMonth()+1}`;
    });
    
    const sentimentScores = last7Entries.map(entry => entry.sentiment);
    
    emotionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Emotional Sentiment',
                data: sentimentScores,
                borderColor: '#5e72e4',
                backgroundColor: 'rgba(94, 114, 228, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#5e72e4',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to resize dynamically
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            if (value === -1) return 'Very Negative';
                            if (value === -0.5) return 'Negative';
                            if (value === 0) return 'Neutral';
                            if (value === 0.5) return 'Positive';
                            if (value === 1) return 'Very Positive';
                            return '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value <= -0.75) return 'Very Negative';
                            if (value <= -0.25) return 'Negative';
                            if (value <= 0.25) return 'Neutral';
                            if (value <= 0.75) return 'Positive';
                            return 'Very Positive';
                        }
                    }
                }
            }
        }
    });
}

function calculateStatistics() {
    if (journalHistory.length === 0) {
        commonEmotionEl.textContent = 'N/A';
        document.querySelector('.stats-card:first-child .stats-label').textContent = 'No entries yet.';
        stabilityScoreEl.textContent = 'N/A';
        document.querySelector('.stats-card:nth-child(2) .stats-label').textContent = 'Journal to see your stability.';
        streakCountEl.textContent = '0 days';
        document.querySelector('.stats-card:last-child .stats-label').textContent = 'Start your streak!';
        return;
    }
    
    // Calculate most common emotion
    const emotionCount = {};
    journalHistory.forEach(entry => {
        entry.dominantEmotions.forEach(emotion => {
            emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
    });
    
    let mostCommonEmotion = '';
    let maxCount = 0;
    for (const emotion in emotionCount) {
        if (emotionCount[emotion] > maxCount) {
            mostCommonEmotion = emotion;
            maxCount = emotionCount[emotion];
        }
    }
    
    const percentage = Math.round((maxCount / journalHistory.length) * 100);
    commonEmotionEl.textContent = mostCommonEmotion;
    document.querySelector('.stats-card:first-child .stats-label').textContent = 
        `Appeared in ${percentage}% of your entries`;
    
    // Calculate stability (variance of sentiment scores)
    const sentiments = journalHistory.map(entry => entry.sentiment);
    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sentiments.length;
    
    // A simplified stability score (closer to 100% means less variance, more stable)
    const stabilityScore = Math.max(0, Math.round((1 - (variance / 0.5)) * 100)); // Divide by max possible variance (e.g., 0.5 for -1 to 1 range, if evenly distributed)
    stabilityScoreEl.textContent = `${stabilityScore}%`;
    document.querySelector('.stats-card:nth-child(2) .stats-label').textContent = 
        stabilityScore > 70 ? 'Your emotions have been relatively stable' : 
        stabilityScore > 40 ? 'Your emotions have moderate fluctuations' : 
        'Your emotions have significant fluctuations';
    
    // Calculate streak (for simplicity, a contiguous sequence of days with entries)
    let streak = 0;
    if (journalHistory.length > 0) {
        // Sort history by date ascending for streak calculation
        const sortedHistory = [...journalHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let currentStreak = 0;
        let lastDate = null;

        for (let i = 0; i < sortedHistory.length; i++) {
            const entryDate = new Date(sortedHistory[i].date);
            if (lastDate === null) {
                currentStreak = 1;
            } else {
                const diffTime = Math.abs(entryDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                    currentStreak = 1; // Reset streak if there's a gap
                }
            }
            streak = Math.max(streak, currentStreak);
            lastDate = entryDate;
        }
    }
    
    streakCountEl.textContent = `${streak} days`;
}