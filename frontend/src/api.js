const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }

  return response.json();
}

export async function createTask(task) {
  const response = await fetch(`${API_BASE_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`);
  }

  return response.json();
}
