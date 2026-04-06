
function showLogin() {
  document.getElementById("login").style.display = "block";
  document.getElementById("signup").style.display = "none";
  document.getElementById("reset").style.display = "none";
}

function showSignup() {
  document.getElementById("signup").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("reset").style.display = "none";
}

function showReset() {
  document.getElementById("reset").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("signup").style.display = "none";
}

// CREATE USER
function send() {

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const email = document.getElementById("email").value;
  const pswd = document.getElementById("pswd").value;

  // ✅ VALIDATION HERE
  if (!name || !email || !pswd) {
    return alert("Please fill all fields");
  }

  // only runs if validation passes
  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      age,
      email,
      pswd
    })
  })
  .then(res => res.text())
  .then(data => {
    document.getElementById("msg").innerText = data;
    loadUsers();
  });
}



// LOGIN (JWT version ONLY)
function login() {
  const data = {
    email: document.getElementById("loginEmail").value,
    pswd: document.getElementById("loginPswd").value
  };

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include" // ✅ REQUIRED
  })
  .then(res => res.json())
  .then(res => {
    if (res.token) {
      window.location.href = "/dashboard.html";
    } else {
      alert(res.message);
    }
  });
}


// LOAD USERS (protected)
function loadUsers() {
  fetch("/users", {
    headers: {
      Authorization: localStorage.getItem("token"),
      credentials: "include" // ✅ REQUIRED
    }
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(user => {
      const li = document.createElement("li");
      li.innerText = user.name + " | " + user.email;

      list.appendChild(li);
    });
  });
}


// DELETE USER
function deleteUser(id) {
  fetch("/delete/" + id, {
    method: "DELETE",
    credentials: "include" // ✅ REQUIRED
  })
  .then(res => res.text())
  .then(data => {
    alert(data);
    loadUsers();
  });
}


// LOGOUT
function logout() {
  fetch("/logout", {
    method: "POST",
    credentials: "include" // ✅ REQUIRED
  })
  .then(() => {
    window.location.href = "/";
  });
}


// PASSWORD RESET
function resetPassword() {
  const data = {
    email: document.getElementById("resetEmail").value,
    newPassword: document.getElementById("newPassword").value
  };

  fetch("/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include" // ✅ REQUIRED
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
  });
}


// DELETE ACCOUNT (JWT secure)
function deleteAccount() {
  if (!confirm("Are you sure?")) return;

  fetch("/delete-account", {
    method: "DELETE",
    credentials: "include" ,// ✅ REQUIRED
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    }
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);

    localStorage.removeItem("token");
    window.location.href = "/";
  });
}