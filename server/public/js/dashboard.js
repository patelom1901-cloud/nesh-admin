const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

fetch(`${API_BASE}/api/admin/dashboard`, {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }
  return res.json();
})
.then(data => {
  if (!data) return;
  const output = document.getElementById("output");
  if (output) {
    output.innerText = JSON.stringify(data, null, 2);
  }
})
.catch((error) => {
  console.error("Dashboard fetch error:", error);
  const output = document.getElementById("output");
  if (output) {
    output.innerText = "Error loading data. Ensure backend is running.";
  }
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}