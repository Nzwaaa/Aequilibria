// State management
let isLoggedIn = false;
let currentUser = null;
let currentJournal = null;
let journalHistory = [];
let currentMonth = new Date().getMonth(); // Current month (0-indexed)
let currentYear = new Date().getFullYear();
let emotionChartInstance; // To hold the Chart.js instance

// --- Peta Konversi Hasil API ---
// Peta ini menerjemahkan hasil klasifikasi API ke skor numerik dan label.
const predictionMap = {
    // Kategori Sangat Negatif
    'Suicidal':             { score: -1.0, label: "Very Negative" },
    'Depression':           { score: -0.8, label: "Very Negative" },
    
    // Kategori Negatif
    'Bipolar':              { score: -0.7, label: "Negative" },
    'Personality disorder': { score: -0.6, label: "Negative" },
    'Anxiety':              { score: -0.5, label: "Negative" },
    'Stress':               { score: -0.4, label: "Negative" },
    
    // Kategori Netral / Normal
    'Normal':               { score: 0.2,  label: "Neutral" } 
};


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
const classificationResult = document.getElementById('classificationResult');
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
     prevMonthBtn.style.display = 'none';
    nextMonthBtn.style.display = 'none';

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
    document.getElementById(`${type}Modal`).style.display = 'flex';
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
    showSection('heroSection');
}

// --- Event Listeners ---

function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        isLoggedIn = true;
        currentUser = {
            name: 'Sarah',
            email: document.getElementById('loginEmail').value
        };
        updateAuthUI();
        closeModal('login');
        alert('Login successful!');
    });

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

    // Journal form submission with actual API call
    document.getElementById('journalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        analyzeJournal();
    });

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
    
    calendarDays.innerHTML = '';
    
    // Tambahkan baris ini untuk mendapatkan tanggal hari ini tanpa informasi waktu
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarDays.appendChild(emptyCell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const fullDate = new Date(year, month, day);
        fullDate.setHours(0, 0, 0, 0); // Set waktu ke 0 untuk perbandingan yang akurat
        const isoDate = fullDate.toISOString().split('T')[0];

        const hasEntry = journalHistory.some(entry => entry.date === isoDate);
        if (hasEntry) {
            dayCell.classList.add('has-entry');
        }
        
        // --- INI ADALAH LOGIKA UTAMA YANG DIUBAH ---
        // Periksa apakah tanggal di sel BUKAN hari ini
        if (fullDate.getTime() !== today.getTime()) {
            dayCell.classList.add('disabled'); // Tambahkan class 'disabled'
        } else {
            // Jika HARI INI, buat terpilih dan bisa diklik
            dayCell.classList.add('selected');
            if (!dateInput.value) {
                setSelectedDate(fullDate);
            }
            
            dayCell.addEventListener('click', () => {
                // Fungsi klik sekarang hanya untuk memastikan tampilan tetap konsisten
                // karena pengguna tidak bisa memilih tanggal lain.
                setSelectedDate(fullDate);
                
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
        }
      
        
        calendarDays.appendChild(dayCell);
    }
}
function setSelectedDate(dateObject) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    selectedDateEl.value = dateObject.toLocaleDateString('en-US', options);
    dateInput.value = dateObject.toISOString().split('T')[0];
}

// --- Journal Analysis and Display (with API) ---

async function analyzeJournal() {
    const journal = document.getElementById('journal').value;
    const date = dateInput.value;

    if (!journal.trim()) {
        alert('Please write something in your journal entry before analyzing.');
        return;
    }

    loadingDiv.style.display = 'block';
    noResultsDiv.style.display = 'none';
    resultsDiv.style.display = 'none';

    try {
        const apiUrl = 'https://aequilibria-production.up.railway.app/predict';
        const requestData = { text: journal };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const prediction = data.prediction;

        const sentimentInfo = predictionMap[prediction] || { score: 0, label: "Neutral" };
        const sentimentScore = sentimentInfo.score;
        const sentimentLabel = sentimentInfo.label;

        const insights = [
            "Your entry shows a need for more self-compassion and acceptance.",
            "You're focusing on challenges but also showing resilience.",
            "There's a strong theme of gratitude in your reflections."
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];

        currentJournal = {
            date: date,
            sentiment: sentimentScore,
            journal: journal,
            classification: prediction,
            keyInsight: randomInsight,
            sentimentLabel: sentimentLabel
        };

        displayAnalysis(currentJournal);

    } catch (error) {
        console.error('Error analyzing journal:', error);
        alert('Sorry, there was an error analyzing your journal. Please try again later.');
        noResultsDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function displayAnalysis(entry) {
    sentimentResultDiv.innerHTML = `Sentiment: <span class="sentiment-indicator" style="background-color: ${getSentimentColor(entry.sentiment)}; color: white;">${entry.sentimentLabel}</span>`;
    
    const classificationColor = getSentimentColor(entry.sentiment);
    classificationResult.innerHTML = `<span class="sentiment-indicator" style="background-color: ${classificationColor}; color: white; padding: 5px 12px; border-radius: 15px;">${entry.classification}</span>`;

    keyInsightsDiv.textContent = entry.keyInsight;
    
    generateMusicRecommendations(entry.sentiment);
    updateSentimentVisualization(entry.sentiment);
    
    loadingDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    noResultsDiv.style.display = 'none';
    
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
        musicData = [
            { title: "Calm Meditation", artist: "Peaceful Minds", icon: "fas fa-spa", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { title: "Healing Piano", artist: "Serenity Sounds", icon: "fas fa-music", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
        ];
    } else if (sentiment < 0) {
        musicData = [
            { title: "Uplifting Melodies", artist: "Hope Ensemble", icon: "fas fa-sun", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
            { title: "Gentle Guitar", artist: "Acoustic Harmony", icon: "fas fa-guitar", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
        ];
    } else if (sentiment < 0.5) {
        musicData = [
            { title: "Focus Flow", artist: "Concentration Crew", icon: "fas fa-brain", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
            { title: "Ambient Atmosphere", artist: "Atmospheric Sounds", icon: "fas fa-cloud", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
        ];
    } else {
        musicData = [
            { title: "Happy Tunes", artist: "Joy Collective", icon: "fas fa-smile", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
            { title: "Upbeat Energy", artist: "Vibrant Vibes", icon: "fas fa-bolt", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" }
        ];
    }
    
    musicData.forEach(music => {
        const musicCard = document.createElement('div');
        musicCard.className = 'music-card';
        const audioId = `audio-${Math.random().toString(36).substr(2, 9)}`;
        
        musicCard.innerHTML = `
            <div class="music-image"><i class="${music.icon}"></i></div>
            <div class="music-content">
                <div class="music-title">${music.title}</div>
                <div class="music-artist">${music.artist}</div>
                <button class="play-btn" onclick="playAudio('${audioId}', this)"><i class="fas fa-play"></i> Play</button>
                <audio id="${audioId}" src="${music.audio}"></audio>
            </div>`;
        musicRecommendationsDiv.appendChild(musicCard);
    });
}

function playAudio(id, button) {
    const audio = document.getElementById(id);
    document.querySelectorAll('audio').forEach(otherAudio => {
        if (otherAudio !== audio && !otherAudio.paused) {
            otherAudio.pause();
            otherAudio.parentElement.querySelector('.play-btn').innerHTML = '<i class="fas fa-play"></i> Play';
        }
    });

    if (audio.paused) {
        audio.play();
        button.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
        audio.pause();
        button.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    audio.onended = () => {
        button.innerHTML = '<i class="fas fa-play"></i> Play';
    };
}

function updateSentimentVisualization(sentiment) {
    const normalizedSentiment = (sentiment + 1) / 2;
    let position = normalizedSentiment * 100;
    sentimentPointer.style.left = `calc(${position}% - 15px)`;
    
    let sentimentLabel = "";
    if (sentiment <= -0.75) sentimentLabel = "Very Negative";
    else if (sentiment <= -0.25) sentimentLabel = "Negative";
    else if (sentiment <= 0.25) sentimentLabel = "Neutral";
    else if (sentiment <= 0.75) sentimentLabel = "Positive";
    else sentimentLabel = "Very Positive";
    
    sentimentValueLabel.textContent = `Sentiment: ${sentimentLabel}`;
    sentimentValueLabel.style.left = `${position}%`;
}

// --- Journal History Management ---

function saveJournal() {
    if (!currentJournal) {
        alert('No journal entry to save. Please analyze an entry first.');
        return;
    }
    
    const existingIndex = journalHistory.findIndex(entry => entry.date === currentJournal.date);
    if (existingIndex !== -1) {
        journalHistory[existingIndex] = currentJournal;
        alert('Journal entry updated successfully!');
    } else {
        journalHistory.push(currentJournal);
        alert('Journal entry saved successfully!');
    }
    
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
    renderCalendar(currentYear, currentMonth);
    renderJournalHistory();
    calculateStatistics(); // Recalculate stats after saving
    renderEmotionChart(); // Re-render chart
}

function loadJournalHistory() {
    const savedHistory = localStorage.getItem('journalHistory');
    if (savedHistory) {
        journalHistory = JSON.parse(savedHistory);
    }
    if (!Array.isArray(journalHistory)) {
        journalHistory = [];
    }
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
            </div>`;
        return;
    }
    
    journalHistory.forEach((entry, index) => {
        const historyCard = document.createElement('div');
        historyCard.className = 'history-card fade-in';
        historyCard.style.animationDelay = `${index * 0.1}s`;
        
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const sentimentStatus = entry.sentimentLabel;
        const statusColor = getSentimentColor(entry.sentiment);
        
        const truncatedJournal = entry.journal.length > 100 ? entry.journal.substring(0, 100) + '...' : entry.journal;
        
        historyCard.innerHTML = `
            <div class="history-date"><i class="far fa-calendar"></i> ${formattedDate}</div>
            <h3 class="history-title">Journal Entry</h3>
            <p style="color: var(--gray); margin-bottom: 15px; font-style: italic;">"${truncatedJournal}"</p>
            <div class="history-stats">
                <div class="stat-item">
                    <span class="stat-label">Sentiment</span>
                    <span class="stat-value" style="color: ${statusColor}">${sentimentStatus}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Classification</span>
                    <span class="stat-value">${entry.classification}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="action-btn view-btn" onclick="viewJournalDetail('${entry.date}')"><i class="fas fa-eye"></i> View Details</button>
                <button class="action-btn delete-btn" onclick="deleteJournal('${entry.date}')"><i class="fas fa-trash"></i> Delete</button>
            </div>`;
        
        historyGrid.appendChild(historyCard);
    });
}

function deleteJournal(dateToDelete) {
    if (confirm('Are you sure you want to delete this journal entry?')) {
        journalHistory = journalHistory.filter(entry => entry.date !== dateToDelete);
        localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
        renderJournalHistory();
        renderCalendar(currentYear, currentMonth);
        calculateStatistics(); // Recalculate stats after deleting
        renderEmotionChart(); // Re-render chart
        alert('Journal entry deleted.');
    }
}

function viewJournalDetail(dateToView) {
    const entry = journalHistory.find(entry => entry.date === dateToView);
    if (!entry) {
        alert('Entry not found!');
        return;
    }
    currentJournal = entry;
    
    const entryDate = new Date(entry.date);
    setSelectedDate(entryDate);
    document.getElementById('journal').value = entry.journal;
    
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
    const dayToSelect = entryDate.getDate();
    const monthToSelect = entryDate.getMonth();
    const yearToSelect = entryDate.getFullYear();
    
    if (monthToSelect !== currentMonth || yearToSelect !== currentYear) {
        currentMonth = monthToSelect;
        currentYear = yearToSelect;
        renderCalendar(currentYear, currentMonth);
    }
    
    const dayCells = calendarDays.querySelectorAll('.calendar-day');
    Array.from(dayCells).find(cell => parseInt(cell.textContent) === dayToSelect && !cell.classList.contains('empty'))?.classList.add('selected');

    displayAnalysis(entry);
    showSection('journalSection');
}

// --- Statistics Functions ---

function renderEmotionChart() {
    if (emotionChartInstance) {
        emotionChartInstance.destroy();
    }

    const ctx = emotionChartCanvas.getContext('2d');
    
    const last7Entries = journalHistory.slice(0, 7).reverse();
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
            maintainAspectRatio: false,
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
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
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
    
    // Calculate most common classification
    const classificationCount = {};
    journalHistory.forEach(entry => {
        const classification = entry.classification;
        if (classification) {
            classificationCount[classification] = (classificationCount[classification] || 0) + 1;
        }
    });
    
    let mostCommonClassification = 'N/A';
    let maxCount = 0;
    for (const classification in classificationCount) {
        if (classificationCount[classification] > maxCount) {
            mostCommonClassification = classification;
            maxCount = classificationCount[classification];
        }
    }
    
    const totalEntriesWithClassification = Object.values(classificationCount).reduce((sum, count) => sum + count, 0);
    const percentage = totalEntriesWithClassification > 0 ? Math.round((maxCount / totalEntriesWithClassification) * 100) : 0;
    commonEmotionEl.textContent = mostCommonClassification;
    document.querySelector('.stats-card:first-child .stats-label').textContent = 
        mostCommonClassification !== 'N/A' ? `Appeared in ${percentage}% of your entries` : 'No classifications yet.';
    
    // Calculate stability (variance of sentiment scores)
    const sentiments = journalHistory.map(entry => entry.sentiment);
    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sentiments.length;
    
    const stabilityScore = Math.max(0, Math.round((1 - variance) * 100));
    stabilityScoreEl.textContent = `${stabilityScore}%`;
    document.querySelector('.stats-card:nth-child(2) .stats-label').textContent = 
        stabilityScore > 70 ? 'Your emotions have been relatively stable' : 
        stabilityScore > 40 ? 'Your emotions have moderate fluctuations' : 
        'Your emotions have significant fluctuations';
    
    // Calculate streak
    let streak = 0;
    if (journalHistory.length > 0) {
        const sortedHistory = [...journalHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let currentStreak = 0;
        let lastDate = null;

        const uniqueDates = [...new Set(sortedHistory.map(e => e.date))].map(d => new Date(d));

        for (let i = 0; i < uniqueDates.length; i++) {
            const entryDate = uniqueDates[i];
            if (lastDate === null) {
                currentStreak = 1;
            } else {
                const diffTime = entryDate - lastDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else if (diffDays > 1) {
                    currentStreak = 1; 
                }
            }
            streak = Math.max(streak, currentStreak);
            lastDate = entryDate;
        }
    }
    
    streakCountEl.textContent = `${streak} days`;
}