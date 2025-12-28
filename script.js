// Basic Interactivity & Mock Data Integration
document.addEventListener('DOMContentLoaded', () => {
    // Current Page Active Link Logic
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Page Specific Initialization
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        populateDashboard();
    }

    if (window.location.pathname.endsWith('planning.html')) {
        initPlanningPage();
    }

    console.log('Craftsman Planner App Loaded');
});

function populateDashboard() {
    if (typeof window.mockData === 'undefined') return;
    const { stats } = window.mockData;

    const activeWorkersEl = document.getElementById('active-workers-count');
    const ordersTodayEl = document.getElementById('orders-today-count');
    const openRequestsEl = document.getElementById('open-requests-count');

    if (activeWorkersEl) activeWorkersEl.innerText = stats.activeWorkers;
    if (ordersTodayEl) ordersTodayEl.innerText = stats.ordersToday;
    if (openRequestsEl) openRequestsEl.innerText = stats.openRequests;
}

/* --- PLANNING PAGE LOGIC --- */

// State for Planning Page
let currentEmployeeFilter = 'all';

function initPlanningPage() {
    renderCalendar();
    renderUnscheduledPool();

    // Attach Event Listener for Filter
    const filterSelect = document.getElementById('employee-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentEmployeeFilter = e.target.value;
            renderCalendar();
        });
    }
}

function renderUnscheduledPool() {
    const pool = document.getElementById('unscheduled-pool');
    if (!pool || !window.mockData) return;

    pool.innerHTML = '';

    // Filter for jobs with status 'offen' (Open/Unscheduled)
    const openJobs = window.mockData.jobs.filter(j => j.status === 'offen');

    if (openJobs.length === 0) {
        pool.innerHTML = '<div style="text-align: center; color: #aaa; padding: 20px;">Keine offenen Aufträge</div>';
        return;
    }

    openJobs.forEach(job => {
        const el = createDraggableJobCard(job);
        pool.appendChild(el);
    });
}

function renderCalendar() {
    const tbody = document.getElementById('calendar-body');
    if (!tbody || !window.mockData) return;

    tbody.innerHTML = '';

    // Defined Slots (Simple approach: Hourly 08:00 - 17:00)
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    // Defined Days matches the HTML columns (Mon 29, Tue 30, Wed 31)
    const days = ['2025-12-29', '2025-12-30', '2025-12-31'];

    hours.forEach(time => {
        const tr = document.createElement('tr');

        // Time Column
        const timeTd = document.createElement('td');
        timeTd.className = 'calendar-time-col';
        timeTd.innerText = time;
        tr.appendChild(timeTd);

        // Day Columns
        days.forEach(dateStr => {
            const td = document.createElement('td');
            td.className = 'calendar-slot';
            td.dataset.date = dateStr;
            td.dataset.time = time;

            // Allow Drop
            td.ondragover = (e) => allowDrop(e);
            td.ondrop = (e) => drop(e, 'calendar');

            // Find jobs for this slot
            const slotStart = new Date(`${dateStr}T${time}`);
            // Check jobs
            const jobsInSlot = window.mockData.jobs.filter(job => {
                if (job.status === 'offen') return false;

                // Filter by Employee
                if (currentEmployeeFilter !== 'all' && !job.assigned_to.includes(currentEmployeeFilter)) {
                    return false;
                }

                // Check overlap (Simple check: starts in this hour)
                const jobStart = new Date(job.start);
                return jobStart.getTime() === slotStart.getTime();
            });

            // Render Jobs
            jobsInSlot.forEach(job => {
                const jobEl = createDraggableJobCard(job);
                td.appendChild(jobEl);
            });

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function createDraggableJobCard(job) {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.draggable = true;
    div.id = job.id;

    // Style differently based on status or type
    let color = 'var(--primary-color)';
    if (job.type === 'Wartung') color = 'var(--accent-color)';
    div.style.borderLeftColor = color;
    div.style.backgroundColor = 'rgba(255,255,255,0.9)';

    div.innerHTML = `<strong>${job.title}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${job.customer}</span>`;

    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text", job.id);
    });

    return div;
}

/* --- DRAG & DROP HANDLERS --- */

function allowDrop(ev) {
    ev.preventDefault();
    if (ev.target.classList.contains('calendar-slot') || ev.target.id === 'unscheduled-pool') {
        ev.target.classList.add('drag-over');
    }
}

function drop(ev, targetType) {
    ev.preventDefault();
    // Clean up drag-over styles
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

    const jobId = ev.dataTransfer.getData("text");
    const job = window.mockData.jobs.find(j => j.id === jobId);

    if (!job) return;

    if (targetType === 'pool') {
        // Drop back to pool
        job.status = 'offen';
        job.assigned_to = []; // Clear assignment
        job.start = null;
        job.end = null;
    } else if (targetType === 'calendar') {
        // Drop onto calendar slot
        let targetSlot = ev.target;
        // Ensure we dropped on the slot TD, not a child element
        while (targetSlot && !targetSlot.classList.contains('calendar-slot')) {
            targetSlot = targetSlot.parentElement;
        }

        if (targetSlot) {
            const date = targetSlot.dataset.date;
            const time = targetSlot.dataset.time;

            // Update Job Data
            job.status = 'geplant';
            job.start = `${date}T${time}:00`;
            // Default duration 1h for now
            let endHour = parseInt(time.split(':')[0]) + 1;
            job.end = `${date}T${String(endHour).padStart(2, '0')}:00:00`;

            // Assign to current filtered employee, or default (Team A) if 'all'
            if (currentEmployeeFilter !== 'all') {
                if (!job.assigned_to.includes(currentEmployeeFilter)) {
                    job.assigned_to = [currentEmployeeFilter]; // Simple assignment replacement
                }
            } else {
                if (job.assigned_to.length === 0) job.assigned_to = ['u1'];
            }
        }
    }

    // Re-render everything
    renderUnscheduledPool();
    renderCalendar();
}


/* --- MODAL LOGIC --- */
function openModal() {
    document.getElementById('order-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
    document.getElementById('new-order-form').reset();
}

function createNewOrder(e) {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const title = document.getElementById('order-title').value;
    const type = document.getElementById('order-type').value;

    const newJob = {
        id: 'j' + (new Date().getTime()),
        title: title,
        customer: customerName,
        type: type,
        status: 'offen',
        start: null,
        end: null,
        assigned_to: []
    };

    window.mockData.jobs.push(newJob);

    // Update stats
    window.mockData.stats.openRequests++;
    populateDashboard();

    closeModal();
    renderUnscheduledPool();
}
