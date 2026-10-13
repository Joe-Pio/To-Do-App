
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api"}/tasks/`;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Could not load tasks (${response.status})`);
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(
        "Unable to connect to the backend. Check that Django is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not create the task.");
      }

      const newTask = await response.json();
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");

    try {
      const response = await fetch(`${API_URL}${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        throw new Error("Could not update the task.");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function deleteTask(taskId) {
    setError("");

    try {
      const response = await fetch(`${API_URL}${taskId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the task.");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="app">
      <section className="todo-container">
        <header className="app-header">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>My To-Do List<span>.</span></h1>
          <p className="subtitle">
            One task at a time. Make today count.
          </p>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span>Total tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="stat-card">
            <span>Remaining</span>
            <strong>{tasks.length - completedCount}</strong>
          </div>
        </section>

        <form className="task-form" onSubmit={handleSubmit}>
          <h2>Add a new task</h2>

          <label htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />

          <label htmlFor="task-description">Description (optional)</label>
          <textarea
            id="task-description"
            placeholder="Add a few details..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />

          <button className="add-button" type="submit" disabled={saving}>
            {saving ? "Adding task..." : "+ Add Task"}
          </button>
        </form>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <section className="task-section">
          <div className="task-section-heading">
            <h2>Your tasks</h2>
            <button
              className="refresh-button"
              type="button"
              onClick={loadTasks}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Loading your tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No tasks yet</h3>
              <p>Add your first task using the form above.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    aria-label={`Mark ${task.title} as ${
                      task.completed ? "incomplete" : "complete"
                    }`}
                  />

                  <div className="task-content">
                    <h3 className={task.completed ? "completed" : ""}>
                      {task.title}
                    </h3>
                    {task.description && <p>{task.description}</p>}
                    <span
                      className={`status ${
                        task.completed ? "status-done" : "status-pending"
                      }`}
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="app-footer">
          React · Django REST Framework · PostgreSQL
        </footer>
      </section>
    </main>
  );
}

export default App;
