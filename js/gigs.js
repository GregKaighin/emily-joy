(function () {
    async function loadGigs() {
        const container = document.getElementById('gigsContainer');
        if (!container) return;

        if (typeof FIREBASE_DB_URL === 'undefined' || FIREBASE_DB_URL.includes('YOUR-PROJECT')) {
            container.innerHTML = '<div class="col-12 text-center"><p class="gigs-empty">Gig listings coming soon.</p></div>';
            return;
        }

        try {
            const res  = await fetch(`${FIREBASE_DB_URL}/gigs.json`);
            const data = await res.json();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const gigs = data
                ? Object.entries(data)
                    .map(([id, gig]) => ({ id, ...gig }))
                    .filter(gig => new Date(gig.date + 'T00:00:00') >= today)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                : [];

            if (gigs.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p class="gigs-empty">No upcoming gigs at the moment — check back soon.</p></div>';
                return;
            }

            container.innerHTML = gigs.map(g => {
                const actClass = g.act === 'Emily Joy' ? 'joy' : 'duo';
                const actLabel = g.act || 'Emily Joy';
                return `
                <div class="col-sm-6 col-lg-4">
                    <div class="gig-card">
                        <p class="gig-day">${fmtDay(g.date)}</p>
                        <p class="gig-fulldate">${fmtDate(g.date)}</p>
                        <span class="act-badge ${actClass}">${esc(actLabel)}</span>
                        <p class="gig-venue">${esc(g.venue)}</p>
                        ${g.time    ? `<p class="gig-time">${esc(g.time)}</p>` : ''}
                        ${g.details ? `<p class="gig-details">${esc(g.details)}</p>` : ''}
                    </div>
                </div>`;
            }).join('');

        } catch (e) {
            container.innerHTML = '<div class="col-12 text-center"><p class="gigs-empty">Unable to load gigs right now.</p></div>';
        }
    }

    function fmtDay(s)  { return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' }); }
    function fmtDate(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    function esc(s)     { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    document.addEventListener('DOMContentLoaded', loadGigs);
})();
