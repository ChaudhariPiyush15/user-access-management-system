// Show forms
function showLogin() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}
function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

// Register new user
function register() {
  let username = document.getElementById("regUsername").value;
  let password = document.getElementById("regPassword").value;
  let role = document.getElementById("regRole").value;

  if(username && password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let exists = users.find(u => u.username === username);
    
    if(exists) {
      alert("Username already exists!");
    } else {
      users.push({username, password, role});
      localStorage.setItem("users", JSON.stringify(users));
      alert("Registration successful! Please login.");
      showLogin();
    }
  } else {
    alert("Please fill all fields!");
  }
}

// Login user
function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.username === username && u.password === password);

  if(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    showDashboard(user);
  } else {
    alert("Invalid credentials!");
  }
}

// Show dashboard based on role
function showDashboard(user) {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("displayUser").innerText = user.username;

  document.querySelector(".admin").style.display = "none";
  document.querySelector(".faculty").style.display = "none";
  document.querySelector(".student").style.display = "none";
  document.querySelector(".hod").style.display = "none";

  if(user.role === "admin") {
    document.querySelector(".admin").style.display = "block";
    loadUsers();
  } else if(user.role === "faculty") {
    document.querySelector(".faculty").style.display = "block";
    loadAttendanceForFaculty();
  } else if(user.role === "student") {
    document.querySelector(".student").style.display = "block";
    loadAttendanceForStudent(user.username);
  } else if(user.role === "hod") {
    document.querySelector(".hod").style.display = "block";
    loadAttendanceForHod();
  }
}

// Load users into admin table
function loadUsers() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let tableBody = document.querySelector("#userTable tbody");
  tableBody.innerHTML = "";

  users.forEach((u, index) => {
    let row = `<tr>
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>
        <button class="action-btn role-btn" onclick="changeRole(${index})">Change Role</button>
        <button class="action-btn delete-btn" onclick="deleteUser(${index})">Delete</button>
      </td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

// Delete user
function deleteUser(index) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if(users[index].username === currentUser.username) {
    alert("You cannot delete yourself!");
    return;
  }

  users.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users));
  loadUsers();
}

// Change user role
function changeRole(index) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if(users[index].username === currentUser.username) {
    alert("You cannot change your own role!");
    return;
  }

  users[index].role = users[index].role === "admin" ? "student" : "admin";
  localStorage.setItem("users", JSON.stringify(users));
  loadUsers();
}

// Faculty: Load students into attendance table
function loadAttendanceForFaculty() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let students = users.filter(u => u.role === "student");
  let tbody = document.querySelector("#attendanceTable tbody");
  tbody.innerHTML = "";
  students.forEach(stu => {
    tbody.innerHTML += `
      <tr>
        <td>${stu.username}</td>
        <td><input type="checkbox" id="att_${stu.username}"></td>
      </tr>`;
  });
}

// Faculty: Save attendance
function saveAttendance() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let students = users.filter(u => u.role === "student");
  let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

  students.forEach(stu => {
    let checked = document.getElementById("att_" + stu.username).checked;
    attendance[stu.username] = attendance[stu.username] || 0;
    if(checked) {
      attendance[stu.username] += 1;  // increment count
    }
  });

  localStorage.setItem("attendance", JSON.stringify(attendance));
  alert("Attendance saved!");
}

// Student: View their attendance
function loadAttendanceForStudent(username) {
  let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  let count = attendance[username] || 0;
  document.getElementById("studentAttendance").innerText = 
    "Your attendance count: " + count;
}

// HOD: View & Modify attendance
function loadAttendanceForHod() {
  let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let students = users.filter(u => u.role === "student");
  let tbody = document.querySelector("#hodAttendanceTable tbody");
  tbody.innerHTML = "";

  students.forEach(stu => {
    let count = attendance[stu.username] || 0;
    tbody.innerHTML += `
      <tr>
        <td>${stu.username}</td>
        <td><input type="number" id="hod_${stu.username}" value="${count}"></td>
        <td><button onclick="updateAttendance('${stu.username}')">Update</button></td>
      </tr>`;
  });
}

// HOD: Update attendance
function updateAttendance(username) {
  let attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  let newValue = parseInt(document.getElementById("hod_" + username).value);
  attendance[username] = newValue;
  localStorage.setItem("attendance", JSON.stringify(attendance));
  alert("Attendance updated for " + username);
}

// Logout user
function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("dashboard").style.display = "none";
  document.querySelector(".admin").style.display = "none";
  document.querySelector(".faculty").style.display = "none";
  document.querySelector(".student").style.display = "none";
  document.querySelector(".hod").style.display = "none";
  showLogin();
}

// Keep user logged in
window.onload = function() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if(currentUser) {
    showDashboard(currentUser);
  } else {
    showRegister();
  }
}