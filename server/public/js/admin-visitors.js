document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("/api/admin/visitors?limit=50", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    const visitors = await res.json();
    const tbody = document.getElementById("visitors-table");
    tbody.innerHTML = "";

    if (visitors.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No visitors recorded yet.</td></tr>";
      return;
    }

    visitors.forEach(v => {
      const tr = document.createElement("tr");
      
      const location = [v.city, v.state, v.country].filter(Boolean).join(", ") || "Unknown";
      const date = new Date(v.lastVisited).toLocaleString();

      tr.innerHTML = `
        <td>${v.ip}</td>
        <td>${location}</td>
        <td>${v.visits}</td>
        <td>${date}</td>
        <td>${v.pages ? v.pages.length : 0}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error fetching visitors:", err);
    document.getElementById("visitors-table").innerHTML = "<tr><td colspan='5'>Error loading data</td></tr>";
  }
});