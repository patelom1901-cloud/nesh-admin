document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // 1. Token Check
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // 2. Logout Function
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    });
  }

  // 3. Fetch Leads
  fetchLeads(token);
});

async function fetchLeads(token) {
  const container = document.getElementById("leadsContainer");

  try {
    const res = await fetch(`${API_BASE}/api/admin/leads`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    // Handle 401
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    const leads = await res.json();

    // Render
    if (leads.length === 0) {
      container.innerHTML = "<p>No leads found.</p>";
      return;
    }

    let html = "<ul>";
    leads.forEach(lead => {
      const date = new Date(lead.createdAt).toLocaleString();
      html += `<li>
        <strong>${lead.name}</strong> (${lead.phone})<br>
        Page: ${lead.page} | Date: ${date}<br>
        Message: ${lead.message || "N/A"}
      </li><br>`;
    });
    html += "</ul>";
    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerText = "Error loading data.";
  }
}