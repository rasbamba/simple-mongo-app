// ================= UI SWITCH =================
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


// ================= SIGNUP =================
function send() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const email = document.getElementById("email").value;
  const pswd = document.getElementById("pswd").value;

  if (!name || !email || !pswd) {
    return alert("Please fill all fields");
  }

  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, email, pswd })
  })
  .then(res => res.json())
  .then(res => {
    document.getElementById("msg").innerText = res.message;

    if (res.message === "Saved securely") {
      alert("Signup successful! Please login.");
      showLogin();
    }
  });
}


// ================= LOGIN =================
function login() {
  const data = {
    email: document.getElementById("loginEmail").value,
    pswd: document.getElementById("loginPswd").value
  };

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  })
  .then(res => res.json())
  .then(res => {
    if (res.message === "Login successful") {
      window.location.href = "/dashboard.html";
    } else {
      alert(res.message);
    }
  });
}


// ================= POSTS =================
function createPost() {
  const text = document.getElementById("postText").value;

  const post = document.createElement("div");
  post.className = "post";
  post.innerText = text;

  document.getElementById("posts").prepend(post);

  document.getElementById("postText").value = "";
}

// ================= LOAD USERS =================
function loadUsers() {
  fetch("/users", {
    credentials: "include"
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


// ================= DELETE USER =================
function deleteUser(id) {
  fetch("/delete/" + id, {
    method: "DELETE",
    credentials: "include"
  })
  .then(res => res.text())
  .then(data => {
    alert(data);
    loadUsers();
  });
}


// ================= LOGOUT =================
function logout() {
  fetch("/logout", {
    method: "POST",
    credentials: "include"
  })
  .then(() => {
    window.location.href = "/";
  });
}


// ================= RESET PASSWORD =================
function resetPassword() {
  const data = {
    email: document.getElementById("resetEmail").value,
    newPassword: document.getElementById("newPassword").value
  };

  fetch("/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.text())
  .then(msg => alert(msg));
}


// ================= DELETE ACCOUNT =================
function deleteAccount() {
  if (!confirm("Are you sure?")) return;

  fetch("/delete-account", {
    method: "DELETE",
    credentials: "include"
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    window.location.href = "/";
  });
}