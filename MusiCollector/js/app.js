document.addEventListener('DOMContentLoaded', () => {
    // Global App State
    const state = {
        isPlaying: false,
        currentTrack: {
            title: "Streets of Gold (ft. Neon City)",
            artist: "Kairo",
            cover: "../assets/images/rap.jpg",
            duration: "3:45"
        },
        user: JSON.parse(localStorage.getItem('musiUser')) || { name: 'Guest Collector', iq: 1250, isLoggedIn: false },
        albums: []
    };

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const filterChips = document.querySelectorAll('.filter-chip');
    const albumsGrid = document.querySelector('.albums-grid');
    const toast = document.getElementById('toastNotification');

    // Sticky Player Elements
    const playMainBtn = document.getElementById('playMainBtn');
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerCover = document.getElementById('playerCover');
    const progressFill = document.querySelector('.progress-fill');

    // Toast Notification helper
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Playback state toggle
    function togglePlay() {
        state.isPlaying = !state.isPlaying;
        if (playMainBtn) {
            playMainBtn.textContent = state.isPlaying ? '⏸' : '▶';
        }
        showToast(state.isPlaying ? `Playing: ${state.currentTrack.title}` : 'Audio Paused');
    }

    if (playMainBtn) {
        playMainBtn.addEventListener('click', togglePlay);
    }

    // Play track from chart or album card
    document.addEventListener('click', (e) => {
        const playBtn = e.target.closest('.play-btn-circle');
        if (playBtn) {
            e.preventDefault();
            e.stopPropagation();
            const card = playBtn.closest('.chart-card') || playBtn.closest('.album-card');
            if (card) {
                const title = card.querySelector('h3, h4')?.textContent || 'Selected Track';
                const artist = card.querySelector('p')?.textContent || 'Unknown Artist';
                const cover = card.querySelector('img')?.getAttribute('src') || '../assets/images/hero.jpg';

                state.currentTrack = { title, artist, cover, duration: '3:30' };
                if (playerTrackTitle) playerTrackTitle.textContent = title;
                if (playerArtist) playerArtist.textContent = artist;
                if (playerCover) playerCover.src = cover;
                
                state.isPlaying = true;
                if (playMainBtn) playMainBtn.textContent = '⏸';
                showToast(`Now Playing: ${title}`);
            }
        }
    });

    // Search Filter Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.chart-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
            document.querySelectorAll('.album-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }

    // Genre Filter Logic
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const genre = chip.getAttribute('data-genre');

            document.querySelectorAll('.album-card').forEach(card => {
                if (genre === 'all' || card.getAttribute('data-genre') === genre) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Modal Helpers
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('open');
        });
    });

    // Interactive Genius Annotation Highlights
    document.querySelectorAll('mark.genius-highlight').forEach(highlight => {
        highlight.addEventListener('click', () => {
            const annotationInfo = highlight.getAttribute('data-annotation') || "Genius verified lyric commentary.";
            const lyricQuote = highlight.textContent;
            
            const modalTitle = document.getElementById('modalTitle');
            const modalText = document.getElementById('modalText');
            
            if (modalTitle && modalText) {
                modalTitle.textContent = `"${lyricQuote}"`;
                modalText.textContent = annotationInfo;
                openModal('annotationModal');
            }
        });
    });

    // Add Album Form Handler
    const addAlbumBtn = document.getElementById('openAddAlbumBtn');
    if (addAlbumBtn) {
        addAlbumBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('addAlbumModal');
        });
    }

    const addAlbumForm = document.getElementById('addAlbumForm');
    if (addAlbumForm) {
        addAlbumForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('albumTitleInput').value;
            const artist = document.getElementById('albumArtistInput').value;
            const genre = document.getElementById('albumGenreInput').value;
            const cover = document.getElementById('albumCoverInput').value || '../assets/images/hero.jpg';

            const newAlbumCard = document.createElement('div');
            newAlbumCard.className = 'album-card';
            newAlbumCard.setAttribute('data-genre', genre);
            newAlbumCard.innerHTML = `
                <img src="${cover}" alt="${title}" class="album-card-img">
                <div class="album-card-body">
                    <h4>${title}</h4>
                    <p>${artist}</p>
                    <div class="album-card-footer">
                        <span class="genre-tag">${genre}</span>
                        <button class="play-btn-circle" title="Play">▶</button>
                    </div>
                </div>
            `;

            if (albumsGrid) {
                albumsGrid.prepend(newAlbumCard);
            }

            // Award IQ points to user
            state.user.iq += 50;
            localStorage.setItem('musiUser', JSON.stringify(state.user));

            closeModal('addAlbumModal');
            addAlbumForm.reset();
            showToast(`Album "${title}" added! +50 Genius IQ`);
        });
    }

    // Auth Modal Handler
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('authModal');
        });
    }

    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('usernameInput').value || 'CollectorUser';
            state.user.name = username;
            state.user.isLoggedIn = true;
            localStorage.setItem('musiUser', JSON.stringify(state.user));

            if (loginLink) loginLink.textContent = `👤 ${username} (${state.user.iq} IQ)`;
            closeModal('authModal');
            showToast(`Welcome back, ${username}!`);
        });
    }
});
