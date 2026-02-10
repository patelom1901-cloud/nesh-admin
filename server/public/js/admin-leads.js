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

    // Render Table
    let html = `<table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr>
          <th>Name / Phone</th>
          <th>Page / Date</th>
          <th>Location</th>
          <th>Stats</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>`;

    leads.forEach(lead => {
      const date = new Date(lead.createdAt).toLocaleString();
      html += `<tr>
        <td><strong>${lead.name}</strong><br>${lead.phone}</td>
        <td>${lead.page}<br><small>${date}</small></td>
        <td>${lead.location}</td>
        <td>Visits: ${lead.visits}<br>Pages: ${lead.pagesViewed}</td>
        <td>${lead.message || ""}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerText = "Error loading data.";
  }
}