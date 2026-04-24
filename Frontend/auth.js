/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */
const API = "/api/auth";

function setMsg(text, isError = true) {
  const msg = document.getElementById("msg");
  if (msg) {
    msg.style.color = isError ? "#b91c1c" : "#15803d";
    msg.textContent = text;
  }
}

async function registerUser() {
  try {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const text = await res.text();
    if (!res.ok) {
      setMsg(text);
      return;
    }

    setMsg("Registered successfully. Redirecting...", false);
    setTimeout(() => location.href = "login.html", 900);
  } catch (e) {
    setMsg("Registration failed");
  }
}

async function login() {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    if (!res.ok) {
      setMsg(text);
      return;
    }

    const user = JSON.parse(text);
    localStorage.setItem("resume_user", JSON.stringify(user));
    location.href = "app.html";
  } catch (e) {
    setMsg("Login failed");
  }
}

