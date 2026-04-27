// ==============================================
// ToDo List - Frontend JavaScript
// ==============================================

const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');

// ==============================================
// Helpers
// ==============================================

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==============================================
// Rendering
// ==============================================

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  taskList.innerHTML = tasks.map(taskTemplate).join('');
}

function taskTemplate(task) {
  const completedClass = task.completed ? 'completed' : '';
  return `
    <li class="list-group-item task-item ${completedClass}" data-id="${task.id}">
      <input
        type="checkbox"
        class="form-check-input task-checkbox"
        ${task.completed ? 'checked' : ''}
        onchange="toggleTask(${task.id})"
        aria-label="Toggle task completion"
      />
      <span class="task-title">${escapeHtml(task.title)}</span>
      <button
        type="button"
        class="delete-btn"
        onclick="deleteTask(${task.id})"
        aria-label="Delete task"
        title="Delete"
      >
        <i class="bi bi-trash-fill"></i>
      </button>
    </li>
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
  }
}

async function createTask(title) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create task');
    await fetchTasks();
  } catch (err) {
    console.error(err);
  }
}

async function toggleTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/toggle`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to update task');
    await fetchTasks();
  } catch (err) {
    console.error(err);
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    await fetchTasks();
  } catch (err) {
    console.error(err);
  }
}

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// ==============================================
// Events
// ==============================================

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await createTask(title);
  titleInput.value = '';
  titleInput.focus();
});

fetchTasks();
