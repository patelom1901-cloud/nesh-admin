async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.token) {
    document.getElementById("error").innerText = "Login failed";
    return;
  }

  localStorage.setItem("token", data.token);
  window.location.href = "/dashboard.html";
}

async function loadDashboard() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const res = await fetch("/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status !== 200) {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
    return;
  }

  const data = await res.json();
  document.getElementById("data").innerText =
    JSON.stringify(data, null, 2);
}

if (window.location.pathname.includes("dashboard")) {
  loadDashboard();
}
