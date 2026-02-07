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
.catch(() => {
  // If the token is invalid or server is down
  console.error("Failed to fetch dashboard data");
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}