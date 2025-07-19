   // State management
        let isLoggedIn = false;
        let currentUser = null;
        let currentJournal = null;
        let journalHistory = [];
        let currentMonth = new Date().getMonth(); // Current month (0-indexed)
        let currentYear = new Date().getFullYear();
        let emotionChartInstance; // To hold the Chart.js instance

        // Sentiment to emoji mapping
        const sentimentEmojiMap = {
            'Normal': '😊',
            'Depression': '😔',
            'Suicidal': '😢',
            'Anxiety': '😰',
            'Stress': '😥',
            'Bipolar': '😐',
            'Personality disorder': '😕'
        };

        // Classification to sentiment mapping
        const classificationToSentiment = {
            'Normal': 0.8,
            'Depression': -0.6,
            'Suicidal': -0.9,
            'Anxiety': -0.4,
            'Stress': -0.3,
            'Bipolar': 0.1,
            'Personality disorder': -0.1
        };

        // Classification color mapping
        const classificationColors = {
            'Normal': '#16a34a',
            'Depression': '#3b82f6',
            'Suicidal': '#ef4444',
            'Anxiety': '#f59e0b',
            'Stress': '#ec4899',
            'Bipolar': '#8b5cf6',
            'Personality disorder': '#64748b'
        };

const activityRecommendations = {
    'Normal': [
        {
            title: "Morning Stretching",
            icon: "fas fa-sun",
            desc: "Start your day with gentle stretching to maintain energy and positivity.",
            ref: "Church, F. C., Mitchell, A. K., & Bliss, R. R. (2024). Exercise, neuroprotective.",
            url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11506540/"
        },
        {
            title: "Gratitude Journaling",
            icon: "fas fa-book",
            desc: "Continue journaling daily to maintain your emotional balance.",
            ref: "Wong, Y.J., & Brown, J.W. (2020). The psychological benefits of gratitude: Evidence from a longitudinal study. Journal of Positive Psychology.",
            url: "https://doi.org/10.1080/17439760.2019.1689414"
        }
    ],
    'Depression': [
        {
            title: "Light Walking",
            icon: "fas fa-walking",
            desc: "Try light physical activity like walking to boost mood and energy levels.",
            ref: "Chen, J., et al. (2024). Physical activity and depression in Taiwanese : A prospective study. Journal of Health and Physical Activity.",
            url: "https://www.sciencedirect.com/science/article/pii/S1755296624000462"
        },
        {
            title: "Social Connection",
            icon: "fas fa-users",
            desc: "Reach out to a friend or loved one for a supportive conversation.",
            ref: "Cacioppo, J.T., & Cacioppo, S. (2018). Loneliness in the modern age. Advances in Experimental Social Psychology.",
            url: "https://doi.org/10.1016/bs.aesp.2018.03.003"
        }
    ],
    'Suicidal': [
        {
            title: "Professional Support",
            icon: "fas fa-user-md",
            desc: "We recommend contacting a mental health professional immediately.",
            ref: "WHO. (2019). Preventing suicide: A global imperative.",
            url: "https://www.who.int/publications/i/item/9789241564779"
        },
        {
            title: "Breathing Techniques",
            icon: "fas fa-wind",
            desc: "Practice deep breathing exercises to help manage intense emotions.",
            ref: "Ma, X., Yue, Z.-Q., et al. (2017). The effect of diaphragmatic breathing on attention, negative affect and stress in healthy adults. Frontiers in Psychology.",
            url: "https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00874/full"
        }
    ],
    'Anxiety': [
        {
            title: "Mindfulness Meditation",
            icon: "fas fa-spa",
            desc: "Practice 10 minutes of mindfulness meditation to calm anxious thoughts.",
            ref: "Keng, S.-L., Smoski, M.J., & Robins, C.J. (2011). Effects of mindfulness on psychological health. Clinical Psychology Review.",
            url: "https://doi.org/10.1016/j.cpr.2010.03.005"
        },
        {
            title: "Nature Walk",
            icon: "fas fa-tree",
            desc: "Spend time in nature to reduce anxiety and improve mood.",
            ref: "Bratman, G.N., et al. (2015). Nature experience reduces rumination and subgenual prefrontal cortex activation. Proceedings of the National Academy of Sciences.",
            url: "https://doi.org/10.1073/pnas.1510459112"
        }
    ],
    'Stress': [
        {
  title: "Progressive Muscle Relaxation",
  icon: "fas fa-hands",
  desc: "Practice tensing and relaxing muscle groups to relieve physical stress.",
  ref: "Webster, K.E. et al. (2025). Effectiveness of stress management and relaxation interventions for hypertension and prehypertension. BMJ Open.",
  url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12164322/"
},

        {
  "title": "Guided Imagery",
  "icon": "fas fa-cloud",
  "desc": "Use visualization techniques to create a peaceful mental space.",
  "ref": "Carroll, R.C. (2022). Guided imagery: Harnessing the power of imagination to combat workplace stress for health care professionals. *Journal of Interprofessional Education & Practice*, Elsevier.",
  "url": "https://www.sciencedirect.com/science/article/pii/S2405452622000258"
}

    ],

    'Bipolar': [
      {
  "title": "Sleep Schedule",
  "icon": "fas fa-bed",
  "desc": "Maintain a consistent sleep schedule to help regulate mood patterns.",
  "ref": "Yeom, J.W., Park, S., & Lee, H.J. (2024). Managing circadian rhythms: A key to enhancing mental health in college students. Psychiatry Investigation.",
  "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11704804/"
},
       {
  "title": "Mood Tracking",
  "icon": "fas fa-chart-line",
  "desc": "Use digital self-monitoring tools to consistently track your mood and identify early warning signs of bipolar episodes.",
  "ref": "Morton, E., Hole, R., O'Brien, H., Li, L.C., & Barnes, S.J. (2025). The experience of self-monitoring using the PolarUs bipolar disorder self-management app: A qualitative report of impacts and unmet needs. Journal of Affective Disorders.",
  "url": "https://www.sciencedirect.com/science/article/pii/S0165032725006822"
}

    ],
    'Personality disorder': [
        {
            title: "Therapeutic Journaling",
            icon: "fas fa-book-medical",
            desc: "Use journaling to explore patterns and emotional triggers.",
            ref: "Baikie, K.A., & Wilhelm, K. (2005). Emotional and physical health benefits of expressive writing. Advances in Psychiatric Treatment.",
            url: "https://doi.org/10.1192/apt.11.5.338"
        },
        {
            title: "Regular Counseling",
            icon: "fas fa-comments",
            desc: "Engage in consistent therapy sessions for long-term support.",
            ref: "National Institute of Mental Health. (2022). Borderline Personality Disorder - Treatment and Therapies.",
            url: "https://www.nimh.nih.gov/health/topics/borderline-personality-disorder"
        }
    ]
};


        // Music recommendations by sentiment
        const musicRecommendations = {
            'Normal': [
                { title: "Calm Meditation", artist: "Peaceful Minds", icon: "fas fa-spa", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
                { title: "Healing Piano", artist: "Serenity Sounds", icon: "fas fa-music", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
            ],
            'Depression': [
                { title: "Uplifting Melodies", artist: "Hope Ensemble", icon: "fas fa-sun", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
                { title: "Gentle Guitar", artist: "Acoustic Harmony", icon: "fas fa-guitar", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
            ],
            'Suicidal': [
                { title: "Comforting Sounds", artist: "Solace Collective", icon: "fas fa-hands-helping", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
                { title: "Peaceful Atmosphere", artist: "Tranquil Tunes", icon: "fas fa-peace", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" }
            ],
            'Anxiety': [
                { title: "Focus Flow", artist: "Concentration Crew", icon: "fas fa-brain", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
                { title: "Ambient Atmosphere", artist: "Atmospheric Sounds", icon: "fas fa-cloud", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
            ],
            'Stress': [
                { title: "Relaxing Nature", artist: "Forest Sounds", icon: "fas fa-tree", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
                { title: "Soothing Ocean", artist: "Wave Harmony", icon: "fas fa-water", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" }
            ],
            'Bipolar': [
                { title: "Balanced Rhythms", artist: "Harmony Group", icon: "fas fa-balance-scale", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
                { title: "Stable Melodies", artist: "Equilibrium Sounds", icon: "fas fa-compass", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" }
            ],
            'Personality disorder': [
                { title: "Understanding Tunes", artist: "Empathy Ensemble", icon: "fas fa-heart", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
                { title: "Self-Discovery", artist: "Journey Music", icon: "fas fa-road", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" }
            ]
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
        const activityRecommendationsDiv = document.getElementById('activityRecommendations');
        const musicRecommendationsDiv = document.getElementById('musicRecommendations');
        const calendarDays = document.getElementById('calendarDays');
        const currentMonthEl = document.getElementById('currentMonth');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const selectedDateEl = document.getElementById('selectedDate');
        const dateInput = document.getElementById('date');
        const emotionChartCanvas = document.getElementById('emotionChart');
        const commonEmotionEl = document.getElementById('commonEmotion');
        const commonEmotionLabel = document.getElementById('commonEmotionLabel');
        const stabilityScoreEl = document.getElementById('stabilityScore');
        const stabilityLabel = document.getElementById('stabilityLabel');
        const streakCountEl = document.getElementById('streakCount');
        const streakLabel = document.getElementById('streakLabel');
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
            
            document.querySelectorAll('.feature-card, .history-card, .stats-card, .form-card, .result-card').forEach(el => {
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
            
            // Filter buttons in history section
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    renderJournalHistory();
                });
            });
        }

        // --- Calendar Functions ---

        function renderCalendar(year, month) {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            currentMonthEl.textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            calendarDays.innerHTML = '';
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                calendarDays.appendChild(emptyCell);
            }
            
            // Add cells for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';
                dayCell.textContent = day;
                
                const fullDate = new Date(year, month, day);
                fullDate.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
                const isoDate = fullDate.toISOString().split('T')[0];

                // Check if this day has a journal entry
                const entry = journalHistory.find(entry => entry.date === isoDate);
                if (entry) {
                    dayCell.classList.add('has-entry');
                    // Add sentiment emoji
                    const emojiSpan = document.createElement('span');
                    emojiSpan.className = 'sentiment-emoji';
                    emojiSpan.textContent = sentimentEmojiMap[entry.classification] || '📝';
                    dayCell.appendChild(emojiSpan);
                }
                
                // Check if this day is today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (fullDate.getTime() === today.getTime()) {
                    dayCell.classList.add('selected');
                    if (!dateInput.value) {
                        setSelectedDate(fullDate);
                    }
                }
                
                dayCell.addEventListener('click', () => {
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

                const insights = [
                    "Your reflections show a need for more self-compassion and acceptance.",
                    "You're focusing on challenges but also showing resilience in your writing.",
                    "There's a strong theme of gratitude in your reflections today."
                ];
                const randomInsight = insights[Math.floor(Math.random() * insights.length)];

                currentJournal = {
                    date: date,
                    sentiment: classificationToSentiment[prediction] || 0,
                    journal: journal,
                    classification: prediction,
                    keyInsight: randomInsight
                };

                displayAnalysis(currentJournal);

            } catch (error) {
                console.error('Error analyzing journal:', error);
                // Fallback to dummy data if API fails
                const fallbackPredictions = ['Normal', 'Depression', 'Anxiety', 'Stress', 'Bipolar', 'Personality disorder'];
                const prediction = fallbackPredictions[Math.floor(Math.random() * fallbackPredictions.length)];
                
                const insights = [
                    "Your reflections show a need for more self-compassion and acceptance.",
                    "You're focusing on challenges but also showing resilience in your writing.",
                    "There's a strong theme of gratitude in your reflections today."
                ];
                const randomInsight = insights[Math.floor(Math.random() * insights.length)];

                currentJournal = {
                    date: date,
                    sentiment: classificationToSentiment[prediction] || 0,
                    journal: journal,
                    classification: prediction,
                    keyInsight: randomInsight
                };

                displayAnalysis(currentJournal);
            } finally {
                loadingDiv.style.display = 'none';
            }
        }

        function displayAnalysis(entry) {
            const sentimentLabel = getSentimentLabel(entry.sentiment);
            sentimentResultDiv.innerHTML = `Sentiment: <span class="sentiment-indicator" style="background-color: ${getSentimentColor(entry.sentiment)}; color: white;">${sentimentLabel}</span>`;
            
            const classificationColor = classificationColors[entry.classification] || '#8392ab';
            classificationResult.innerHTML = `<span class="classification-badge" style="background-color: ${classificationColor}; color: white;">${entry.classification} ${sentimentEmojiMap[entry.classification] || ''}</span>`;

            keyInsightsDiv.textContent = entry.keyInsight;
            
            generateActivityRecommendations(entry.classification);
            generateMusicRecommendations(entry.classification);
            updateSentimentVisualization(entry.classification);
            
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

        function getSentimentLabel(sentiment) {
            if (sentiment <= -0.75) return "Very Negative";
            if (sentiment <= -0.25) return "Negative";
            if (sentiment <= 0.25) return "Neutral";
            if (sentiment <= 0.75) return "Positive";
            return "Very Positive";
        }

        function getSentimentColor(sentiment) {
            if (sentiment <= -0.75) return '#dc2626'; // Very Negative
            if (sentiment <= -0.25) return '#ea580c'; // Negative
            if (sentiment <= 0.25) return '#2563eb'; // Neutral
            if (sentiment <= 0.75) return '#16a34a'; // Positive
            return '#0d9488'; // Very Positive
        }

        function generateActivityRecommendations(classification) {
            activityRecommendationsDiv.innerHTML = '';
            
            const recommendations = activityRecommendations[classification] || activityRecommendations['Normal'];
            
            recommendations.forEach(activity => {
                const activityCard = document.createElement('div');
                activityCard.className = 'activity-card';
                
                activityCard.innerHTML = `
                    <div class="activity-title">
                        <i class="${activity.icon} activity-icon"></i>
                        ${activity.title}
                    </div>
                    <div class="activity-desc">${activity.desc}</div>
                    <div class="journal-ref">
                      Reference: <a href="${activity.url}" target="_blank" rel="noopener noreferrer">
        ${activity.ref}
        </a>
                `;
                
                activityRecommendationsDiv.appendChild(activityCard);
            });
        }

        function generateMusicRecommendations(classification) {
            musicRecommendationsDiv.innerHTML = '';
            
            const recommendations = musicRecommendations[classification] || musicRecommendations['Normal'];
            
            recommendations.forEach(music => {
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

        function updateSentimentVisualization(classification) {
            const positions = {
                'Suicidal': 0,
                'Depression': 20,
                'Anxiety': 40,
                'Stress': 60,
                'Bipolar': 80,
                'Personality disorder': 100,
                'Normal': 50
            };
            
            const position = positions[classification] || 50;
            sentimentPointer.style.left = `calc(${position}% - 15px)`;
            
            sentimentValueLabel.textContent = `Classification: ${classification}`;
            sentimentValueLabel.style.left = `${position}%`;
        }

        // --- Journal History Management ---

        function saveJournal() {
            if (!currentJournal) {
                alert('No journal entry to save. Please analyze an entry first.');
                return;
            }
            
            if (!isLoggedIn) {
                alert('Please log in or create an account to save your journal entries.');
                openModal('login');
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
            
            // Filter based on selection
            const filter = document.querySelector('.filter-btn.active').textContent;
            let filteredEntries = [...journalHistory];
            
            if (filter === 'Last Month') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                filteredEntries = journalHistory.filter(entry => new Date(entry.date) > oneMonthAgo);
            } else if (filter === 'Last 6 Months') {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                filteredEntries = journalHistory.filter(entry => new Date(entry.date) > sixMonthsAgo);
            }
            
            filteredEntries.forEach((entry, index) => {
                const historyCard = document.createElement('div');
                historyCard.className = 'history-card fade-in';
                historyCard.style.animationDelay = `${index * 0.1}s`;
                
                const entryDate = new Date(entry.date);
                const formattedDate = entryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                
                const classificationColor = classificationColors[entry.classification] || '#8392ab';
                const sentimentLabel = getSentimentLabel(entry.sentiment);
                
                const truncatedJournal = entry.journal.length > 100 ? entry.journal.substring(0, 100) + '...' : entry.journal;
                
                historyCard.innerHTML = `
                    <div class="history-header-card">
                        <div class="history-date">
                            <i class="far fa-calendar"></i> ${formattedDate}
                        </div>
                        <span class="classification-badge" style="background-color: ${classificationColor}; color: white;">
                            ${entry.classification} ${sentimentEmojiMap[entry.classification] || ''}
                        </span>
                    </div>
                    <div class="history-body">
                        <div class="history-content">"${truncatedJournal}"</div>
                        <div style="margin-top: 15px; color: ${getSentimentColor(entry.sentiment)}; font-weight: 500;">
                            <i class="fas fa-smile"></i> Sentiment: ${sentimentLabel}
                        </div>
                    </div>
                    <div class="history-footer">
                        <div class="history-actions">
                            <button class="action-btn view-btn" onclick="viewJournalDetail('${entry.date}')"><i class="fas fa-eye"></i> View Details</button>
                            <button class="action-btn delete-btn" onclick="deleteJournal('${entry.date}')"><i class="fas fa-trash"></i> Delete</button>
                        </div>
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
                commonEmotionLabel.textContent = 'No entries yet.';
                stabilityScoreEl.textContent = 'N/A';
                stabilityLabel.textContent = 'Journal to see your stability.';
                streakCountEl.textContent = '0 days';
                streakLabel.textContent = 'Start your streak!';
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
            commonEmotionLabel.textContent = mostCommonClassification !== 'N/A' ? `Appeared in ${percentage}% of your entries` : 'No classifications yet.';
            
            // Calculate stability (variance of sentiment scores)
            const sentiments = journalHistory.map(entry => entry.sentiment);
            const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
            const variance = sentiments.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sentiments.length;
            
            const stabilityScore = Math.max(0, Math.round((1 - variance) * 100));
            stabilityScoreEl.textContent = `${stabilityScore}%`;
            stabilityLabel.textContent = 
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
            streakLabel.textContent = streak > 5 ? 'Keep up the good work!' : 'Start building your streak!';
        }

        // Fungsi untuk carousel psikolog
        document.addEventListener('DOMContentLoaded', function() {
            const carouselContainer = document.querySelector('.carousel-container');
            const cards = document.querySelectorAll('.psychologist-card');
            const dots = document.querySelectorAll('.carousel-dot');
            const prevBtn = document.querySelector('.carousel-prev');
            const nextBtn = document.querySelector('.carousel-next');
            
            let currentIndex = 0;
            const totalCards = cards.length;
            
            function updateCarousel() {
                carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                // Update active dot
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
            
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % totalCards;
                updateCarousel();
            });
            
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                updateCarousel();
            });
            
            // Auto slide every 5 seconds
            setInterval(() => {
                currentIndex = (currentIndex + 1) % totalCards;
                updateCarousel();
            }, 5000);
            
            // Dot navigation
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                });
            });
        });