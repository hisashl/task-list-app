// ==============================================
// Task List App - Frontend JavaScript
// ==============================================

const API_URL = '/api/tasks';

// DOM elements
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const taskStats = document.getElementById('task-stats');
const toastEl = document.getElementById('notification-toast');
const toastMessage = document.getElementById('toast-message');
const toast = new bootstrap.Toast(toastEl, { delay: 2500 });

// ==============================================
// Helpers
// ==============================================

function showToast(message, type = 'primary') {
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastMessage.textContent = message;
  toast.show();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ==============================================
// Rendering
// ==============================================

function renderTasks(tasks) {
  loadingState.classList.add('d-none');

  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('d-none');
    taskStats.textContent = '0 tasks';
    return;
  }

  emptyState.classList.add('d-none');

  const completedCount = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  taskStats.textContent = `${total} task${total !== 1 ? 's' : ''} · ${completedCount} completed`;

  taskList.innerHTML = tasks.map(taskTemplate).join('');
}

function taskTemplate(task) {
  const completedClass = task.completed ? 'completed' : '';
  const badge = task.completed
    ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Completed</span>'
    : '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Pending</span>';

  const description = task.description
    ? `<div class="task-description">${escapeHtml(task.description)}</div>`
    : '';

  return `
    <div class="task-item ${completedClass}" data-id="${task.id}">
      <input
        type="checkbox"
        class="form-check-input task-checkbox"
        ${task.completed ? 'checked' : ''}
        onchange="toggleTask(${task.id})"
        aria-label="Toggle task completion"
      />
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${description}
        <div class="task-meta">
          ${badge}
          <span class="created-at">
            <i class="bi bi-clock me-1"></i>${formatDate(task.created_at)}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          onclick="deleteTask(${task.id})"
          aria-label="Delete task"
          title="Delete task"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// ==============================================
// API calls
// ==============================================

async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    console.error(err);
    loadingState.classList.add('d-none');
    showToast('Could not load tasks', 'danger');
  }
}

async function createTask(title, description) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create task');
    }

    showToast('Task created', 'success');
    await fetchTasks();
  } catch (err) {
    console.error(err);
    showToast(err.message, 'danger');
  }
}

async function toggleTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/toggle`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to update task');
    await fetchTasks();
  } catch (err) {
    console.error(err);
    showToast('Could not update task', 'danger');
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    showToast('Task deleted', 'success');
    await fetchTasks();
  } catch (err) {
    console.error(err);
    showToast('Could not delete task', 'danger');
  }
}

// Expose functions used in inline handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// ==============================================
// Event listeners
// ==============================================

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showToast('Please enter a title', 'warning');
    return;
  }

  await createTask(title, description);
  taskForm.reset();
  titleInput.focus();
});

// Initial load
fetchTasks();
