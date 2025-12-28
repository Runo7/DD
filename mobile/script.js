// Mobile App Logic

// Global State
let mobileCurrentDate = new Date('2025-12-29T12:00:00');

// Mock Templates (in a real app, these would come from backend/settings)
const formTemplates = {
    'wartung_gas': {
        title: 'Wartung Gastherme',
        description: '- Brenner gereinigt\n- Zündelektroden geprüft\n- Druckausgleichsbehälter geprüft\n- Abgasmessung durchgeführt',
        materials: '1x Dichtungssatz A\n1x Zündelektrode Typ B'
    },
    'bad_sani': {
        title: 'Badsanierung Rohbau',
        description: '- Alte Leitungen entfernt\n- Schlitze gestemmt\n- Abflussleitungen DN50 verlegt\n- Spülkasten montiert',
        materials: '5m HT-Rohr DN50\n4x Bogen 45°\n1x GIS-Modul WC'
    },
    'heizung_stoerung': {
        title: 'Störungsbehebung Heizung',
        description: '- Fehlerspeicher ausgelesen (Fehler F4)\n- Pumpe gängig gemacht\n- Anlage entlüftet\n- Probelauf erfolgreich',
        materials: 'Kleinmaterial'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Current Page Detection
    if (document.getElementById('next-job-card')) {
        populateMobileDashboard();
    }
    if (document.getElementById('schedule-list')) {
        initScheduleHelper();
    }

    // Auto-Init Signatures if standard Canvas present
    const canvasList = document.querySelectorAll('canvas.signature-canvas');
    canvasList.forEach(canvas => {
        new SignaturePad(canvas);
    });
});

/* --- SIGNATURE PAD LOGIC --- */
class SignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;

        // Resize canvas to match display size (prevent pixelation)
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Events
        this.canvas.addEventListener('mousedown', (e) => this.start(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stop());
        this.canvas.addEventListener('mouseout', () => this.stop());

        this.canvas.addEventListener('touchstart', (e) => this.start(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.draw(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.stop());
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    start(e) {
        e.preventDefault();
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        const pos = this.getPos(e);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    stop() {
        this.isDrawing = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Global helper to clear a specific canvas by ID substring
window.clearSignature = function (padId) {
    const canvas = document.querySelector(`#${padId} canvas`);
    // Re-initialize or just clear rect if we had access to the instance. 
    // For simplicity, we just clear context.
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};


/* --- TEMPLATE LOGIC --- */
window.applyTemplate = function (selectElement) {
    const key = selectElement.value;
    if (!key || !formTemplates[key]) return;

    const tpl = formTemplates[key];

    // Find fields (Assuming standardised IDs for the Work Report page)
    const title = document.getElementById('report-title'); // "Kunde/Projekt" input often doubles as title context
    const desc = document.getElementById('report-desc');
    const mat = document.getElementById('report-materials');

    // Confirm override
    if (desc && desc.value.length > 5 && !confirm('Vorhandenen Text überschreiben?')) return;

    if (desc) desc.value = tpl.description;
    if (mat) mat.value = tpl.materials;
    // if (title) title.value = tpl.title; // Optional: Override project title? Probably not, user sets project first.
};

/* --- PREVIEW LOGIC --- */
window.showA4Preview = function (docTitle) {
    alert(`[VORSCHAU A4]\n\nDas Dokument "${docTitle}" wird als PDF generiert...\n\n(Hier würde sich die PDF-Ansicht öffnen)`);
};

window.saveDocument = function () {
    alert('Dokument erfolgreich gespeichert und synchronisiert!');
    window.location.href = 'documents.html';
};


/* --- EXISTING DASHBOARD & SCHEDULE LOGIC --- */
function populateMobileDashboard() {
    if (typeof window.mockData === 'undefined') return;
    const currentUserId = 'u1';
    const jobs = window.mockData.jobs.filter(j => j.assigned_to.includes(currentUserId) && j.status !== 'offen');
    jobs.sort((a, b) => new Date(a.start) - new Date(b.start));
    const nextJob = jobs.find(j => new Date(j.end) > new Date());
    const container = document.getElementById('next-job-card');

    if (nextJob) {
        const startTime = new Date(nextJob.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(nextJob.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        container.innerHTML = `
            <div class="card-title">${nextJob.title}</div>
            <div class="card-subtitle" style="margin-bottom: 10px;">
                <i class="fas fa-clock"></i> ${startTime} - ${endTime} <br>
                <i class="fas fa-map-marker-alt"></i> ${nextJob.customer}
            </div>
            <div class="status-badge status-planned">Geplant</div>
            <button style="display: block; width: 100%; padding: 12px; background-color: var(--primary-color); color: white; border: none; border-radius: 8px; margin-top: 15px; font-weight: 500;">Zum Auftrag</button>
        `;
    } else {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 10px;">Keine anstehenden Aufträge.</div>`;
    }
}

function initScheduleHelper() {
    document.getElementById('prev-day').addEventListener('click', () => changeDate(-1));
    document.getElementById('next-day').addEventListener('click', () => changeDate(1));
    populateSchedule();
}

function changeDate(days) {
    mobileCurrentDate.setDate(mobileCurrentDate.getDate() + days);
    populateSchedule();
}

function populateSchedule() {
    if (typeof window.mockData === 'undefined') return;
    const dateDisplay = document.getElementById('current-date-display');
    const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' };
    dateDisplay.innerText = mobileCurrentDate.toLocaleDateString('de-DE', options);

    const currentUserId = 'u1';
    const selectedDateStr = mobileCurrentDate.toISOString().split('T')[0];
    const jobs = window.mockData.jobs.filter(j => {
        if (!j.assigned_to.includes(currentUserId)) return false;
        if (j.status === 'offen') return false;
        if (!j.start) return false;
        const jobDateStr = new Date(j.start).toISOString().split('T')[0];
        return jobDateStr === selectedDateStr;
    });

    const list = document.getElementById('schedule-list');
    if (jobs.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;"><i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px; color: #eee;"></i><br>Keine Aufträge für diesen Tag.</div>`;
        return;
    }

    let timelineHtml = '<div class="timeline-container">';
    for (let i = 8; i <= 17; i++) {
        const hour = String(i).padStart(2, '0') + ':00';
        const jobsInHour = jobs.filter(job => new Date(job.start).getHours() === i);

        timelineHtml += `<div class="time-slot"><div class="time-label">${hour}</div>${jobsInHour.length > 0 ? '<div class="timeline-point"></div>' : ''}${jobsInHour.map(job => {
            const timeEnd = new Date(job.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            let borderCol = job.type === 'Wartung' ? 'var(--accent-color)' : 'var(--primary-color)';
            return `<div class="timeline-event" style="border-left-color: ${borderCol}"><div style="font-weight: 600; margin-bottom: 4px;">${job.title}</div><div style="font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-clock"></i> Bis ${timeEnd} <br><i class="fas fa-map-marker-alt"></i> ${job.customer}</div></div>`;
        }).join('')}</div>`;
    }
    timelineHtml += '</div>';
    list.innerHTML = timelineHtml;
}
