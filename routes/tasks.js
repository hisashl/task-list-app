const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// MySQL stores BOOLEAN as TINYINT(1). Normalize to a real boolean for the API.
function normalizeTask(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: Boolean(row.completed),
    created_at: row.created_at,
  };
}

// GET /api/tasks - get all tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at FROM tasks ORDER BY completed ASC, created_at DESC'
    );
    res.json(rows.map(normalizeTask));
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - create a new task
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be 255 characters or fewer' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, completed) VALUES (?, ?, FALSE)',
      [title.trim(), description ? description.trim() : null]
    );

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(normalizeTask(rows[0]));
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id/toggle - toggle completed/pending status
router.put('/:id/toggle', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const [updateResult] = await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = ?',
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, created_at FROM tasks WHERE id = ?',
      [id]
    );

    res.json(normalizeTask(rows[0]));
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted', id: parseInt(id, 10) });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
