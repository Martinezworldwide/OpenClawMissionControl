document.addEventListener('DOMContentLoaded', () => {
    fetch('data/control_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderDashboard(data);
        })
        .catch(error => {
            console.error('Error loading Mission Control data:', error);
            document.querySelector('.dashboard-container').innerHTML = `
                <div style="color: var(--error-red); text-align: center; padding: 50px; background: rgba(0,0,0,0.5); border-radius: 10px;">
                    <h2>ERROR: Failed to load Mission Control data.</h2>
                    <p>Please ensure 'data/control_data.json' exists and is correctly formatted.</p>
                    <p>Details: ${error.message}</p>
                </div>
            `;
        });
});

function renderDashboard(data) {
    // Agent Status
    const agentStatusText = document.getElementById('agent-status').querySelector('.text');
    if (data.agentStatus.status === 'online') {
        document.getElementById('agent-status').querySelector('.dot').style.backgroundColor = 'var(--success-green)';
        agentStatusText.textContent = `Agent Status: Online (${data.agentStatus.currentModel})`;
    } else {
        document.getElementById('agent-status').querySelector('.dot').style.backgroundColor = 'var(--error-red)';
        agentStatusText.textContent = `Agent Status: ${data.agentStatus.status}`;
    }

    // Current Task
    document.getElementById('current-task-display').textContent = data.currentTask.description || 'Awaiting new directives.';

    // Kanban Task View
    renderKanbanColumn('tasks-queued', data.kanban.queued);
    renderKanbanColumn('tasks-in-progress', data.kanban.inProgress);
    renderKanbanColumn('tasks-completed', data.kanban.completed);

    // Key Metrics
    document.getElementById('token-usage').textContent = data.metrics.tokenUsage || 'N/A';
    document.getElementById('api-calls').textContent = data.metrics.apiCalls || 'N/A';
    document.getElementById('error-count').textContent = data.metrics.errorCount || 'N/A';
    document.getElementById('total-cost').textContent = data.metrics.totalCost || 'N/A';

    // Recent Commits
    const recentCommitsList = document.getElementById('recent-commits');
    recentCommitsList.innerHTML = '';
    if (data.recentCommits && data.recentCommits.length > 0) {
        data.recentCommits.forEach(commit => {
            const li = document.createElement('li');
            li.textContent = `${commit.timestamp}: ${commit.message} (${commit.repo})`;
            recentCommitsList.appendChild(li);
        });
    } else {
        recentCommitsList.innerHTML = '<li>No recent commits.</li>';
    }

    // Scheduled Operations (Cron Jobs)
    const scheduledOpsList = document.getElementById('scheduled-operations');
    scheduledOpsList.innerHTML = '';
    if (data.scheduledOperations && data.scheduledOperations.length > 0) {
        data.scheduledOperations.forEach(op => {
            const li = document.createElement('li');
            li.textContent = `${op.nextRunTime}: ${op.name} (${op.type})`;
            scheduledOpsList.appendChild(li);
        });
    } else {
        scheduledOpsList.innerHTML = '<li>No scheduled operations.</li>';
    }

    // Agent Communication Log
    document.getElementById('agent-comms-log').textContent = data.agentCommsLog || 'No recent communications.';

    // Skill Idea Snapshots
    document.getElementById('skill-ideas-display').textContent = data.skillIdeas || 'No new skill ideas.';
}

function renderKanbanColumn(ulId, tasks) {
    const ul = document.getElementById(ulId);
    ul.innerHTML = '';
    if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.description;
            ul.appendChild(li);
        });
    } else {
        ul.innerHTML = '<li>No tasks.</li>';
    }
}

// Function to periodically update data (will be called externally by me)
function updateMissionControlData(newData) {
    // This function will be called by me internally to update the control_data.json
    // For now, it just re-renders the dashboard with new data
    renderDashboard(newData);
}
