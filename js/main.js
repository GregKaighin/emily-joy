// ── Gold glitter overlay ─────────────────────────────────────
(function initGlitter() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000;';
    document.body.appendChild(canvas);

    const ctx  = canvas.getContext('2d');
    const GOLD = '#f0b0c8';
    const COUNT = 90;
    let W, H, particles;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function Particle(scatter) {
        this.init = function(scatter) {
            this.x     = Math.random() * W;
            this.y     = scatter ? Math.random() * H : H + 6;
            this.r     = Math.random() * 1.4 + 0.3;
            this.vy    = -(Math.random() * 0.35 + 0.12);
            this.vx    = (Math.random() - 0.5) * 0.12;
            this.phase = Math.random() * Math.PI * 2;
            this.freq  = Math.random() * 0.014 + 0.007;
            this.type  = Math.random() > 0.6 ? 'star' : 'dot';
        };
        this.init(scatter);

        this.update = function() {
            this.y     += this.vy;
            this.x     += this.vx;
            this.phase += this.freq;
            if (this.y < -6) this.init(false);
        };

        this.draw = function() {
            const alpha = Math.sin(this.phase) * 0.17 + 0.21;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle   = GOLD;
            ctx.strokeStyle = GOLD;

            if (this.type === 'star') {
                const s = this.r * 2.8;
                const d = s * 0.64;
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                ctx.moveTo(this.x - s, this.y); ctx.lineTo(this.x + s, this.y);
                ctx.moveTo(this.x, this.y - s); ctx.lineTo(this.x, this.y + s);
                ctx.moveTo(this.x - d, this.y - d); ctx.lineTo(this.x + d, this.y + d);
                ctx.moveTo(this.x + d, this.y - d); ctx.lineTo(this.x - d, this.y + d);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };
    }

    function loop() {
        if (document.hidden) { requestAnimationFrame(loop); return; }
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => { if (p.x > W) p.init(false); });
    });

    resize();
    particles = Array.from({ length: COUNT }, () => new Particle(true));
    loop();
})();

// Navbar: transparent → dark on scroll
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 80);
});

// Close mobile nav when a link is clicked
document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const collapse = document.getElementById('navbarNav');
        if (collapse.classList.contains('show')) {
            bootstrap.Collapse.getInstance(collapse)?.hide();
        }
    });
});

// Fade-up on scroll using IntersectionObserver
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
    });
}, { threshold: 0.12 });
fadeEls.forEach(el => observer.observe(el));

// ── Video facade + custom controls ──────────────────────────
const videoFacade  = document.getElementById('videoFacade');
const videoEmbed   = document.getElementById('videoEmbed');

function activateVideo() {
    if (!videoFacade) return;
    videoFacade.style.display = 'none';
    videoEmbed.classList.remove('d-none');
    document.getElementById('videoPlayer').play();
}

if (videoFacade) {
    videoFacade.addEventListener('click', activateVideo);
    videoFacade.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateVideo(); }
    });
}

// "Watch Showreel" links — scroll then autoplay
document.querySelectorAll('a[href="#video"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const section = document.getElementById('video');
        section.scrollIntoView({ behavior: 'smooth' });
        let done = false;
        const trigger = () => { if (!done) { done = true; activateVideo(); } };
        window.addEventListener('scrollend', trigger, { once: true });
        setTimeout(trigger, 900); // fallback for browsers without scrollend
    });
});

(function initVideoControls() {
    const video        = document.getElementById('videoPlayer');
    const controls     = document.getElementById('videoControls');
    const progressArea = document.getElementById('vcProgressArea');
    const fill         = document.getElementById('vcFill');
    const thumb        = document.getElementById('vcThumb');
    const playBtn      = document.getElementById('vcPlayPause');
    const playIcon     = document.getElementById('vcPlayIcon');
    const timeEl       = document.getElementById('vcTime');
    const muteBtn      = document.getElementById('vcMute');
    const volIcon      = document.getElementById('vcVolIcon');
    const fsBtn        = document.getElementById('vcFullscreen');
    const fsIcon       = document.getElementById('vcFsIcon');
    const wrap         = document.getElementById('videoEmbed');

    if (!video) return;

    const fmt = s => {
        const m = Math.floor((s || 0) / 60);
        const sec = String(Math.floor((s || 0) % 60)).padStart(2, '0');
        return `${m}:${sec}`;
    };

    const setProgress = pct => {
        fill.style.width = `${pct * 100}%`;
        thumb.style.left = `${pct * 100}%`;
    };

    const posFromEvent = e => {
        const rect = progressArea.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };

    const syncPlayIcon = () => {
        playIcon.className = video.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
        controls.classList.toggle('paused', video.paused);
    };

    playBtn.addEventListener('click', () => video.paused ? video.play() : video.pause());
    video.addEventListener('play',  syncPlayIcon);
    video.addEventListener('pause', syncPlayIcon);
    video.addEventListener('ended', syncPlayIcon);

    video.addEventListener('click', () => video.paused ? video.play() : video.pause());

    video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        setProgress(video.currentTime / video.duration);
        timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
    });

    video.addEventListener('loadedmetadata', () => {
        timeEl.textContent = `0:00 / ${fmt(video.duration)}`;
    });

    let dragging = false;

    const seekTo = e => {
        if (!video.duration) return;
        const pos = posFromEvent(e);
        video.currentTime = pos * video.duration;
        setProgress(pos);
    };

    progressArea.addEventListener('mousedown',  e => { dragging = true; progressArea.classList.add('dragging'); seekTo(e); });
    progressArea.addEventListener('touchstart', e => { dragging = true; progressArea.classList.add('dragging'); seekTo(e); }, { passive: true });

    document.addEventListener('mousemove',  e => { if (dragging) seekTo(e); });
    document.addEventListener('touchmove',  e => { if (dragging) seekTo(e); }, { passive: true });
    document.addEventListener('mouseup',  () => { dragging = false; progressArea.classList.remove('dragging'); });
    document.addEventListener('touchend', () => { dragging = false; progressArea.classList.remove('dragging'); });

    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        volIcon.className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    });

    fsBtn.addEventListener('click', () => {
        const el = wrap;
        if (!document.fullscreenElement) {
            (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        fsIcon.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    });

    let hideTimer;
    const showControls = () => {
        controls.style.opacity = '1';
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!video.paused) controls.style.opacity = '';
        }, 3000);
    };
    wrap.addEventListener('mousemove', showControls);
    wrap.addEventListener('touchstart', showControls, { passive: true });
    wrap.addEventListener('mouseleave', () => { if (!video.paused) controls.style.opacity = ''; });
})();

// ── Success chime — E4 → B4 → G4 ──
function playChime() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ac = new AudioCtx();

    const notes = [
        [329.63, 0.00, 0.20, 2.2],
        [493.88, 0.30, 0.16, 2.0],
        [392.00, 0.52, 0.22, 3.0],
    ];

    notes.forEach(([freq, delay, peak, decay]) => {
        const osc      = ac.createOscillator();
        const gainNode = ac.createGain();
        const osc2     = ac.createOscillator();
        const gain2    = ac.createGain();

        osc2.type = 'triangle';
        osc2.frequency.value = freq;
        gain2.gain.value = 0.3;
        osc2.connect(gain2);
        gain2.connect(gainNode);

        osc.connect(gainNode);
        gainNode.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;

        const t = ac.currentTime + delay;
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(peak, t + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + decay);

        osc.start(t);  osc.stop(t + decay);
        osc2.start(t); osc2.stop(t + decay);
    });
}

// Booking form: client-side validation + Formspree submission
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');

bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!bookingForm.checkValidity()) {
        bookingForm.classList.add('was-validated');
        return;
    }
    const submitBtn = bookingForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Sending…';

    const payload = {
        _replyto:         document.getElementById('email').value,
        _subject:         'New Booking Enquiry — Emily Joy',
        'Name':           document.getElementById('name').value,
        'Email':          document.getElementById('email').value,
        'Phone Number':   document.getElementById('phone').value,
        'Event Date':     document.getElementById('eventDate').value,
        'Event Type':     document.getElementById('eventType').value,
        'Event Location': document.getElementById('location').value,
        'Message':        document.getElementById('message').value
    };

    fetch('https://formspree.io/f/xyklwngb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
    .then(data => {
        if (data.ok) {
            playChime();
            formSuccess.classList.remove('d-none');
            formSuccess.classList.add('show');
            formSuccess.focus();
            bookingForm.reset();
            bookingForm.classList.remove('was-validated');
            setTimeout(() => {
                formSuccess.classList.remove('show');
                formSuccess.classList.add('d-none');
            }, 6000);
        } else {
            alert('Sorry, something went wrong. Please email me directly at songbirdemz@gmail.com');
        }
    })
    .catch(() => alert('Sorry, something went wrong. Please email me directly at songbirdemz@gmail.com'))
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send Enquiry';
    });
});
