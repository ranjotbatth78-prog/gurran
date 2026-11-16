
// Attendance Management System

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("attendance", JSON.stringify(attendance));
}

function clean(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

// LOGIN
function login() {
  let user = document.getElementById("username").value.trim();
  let pass = document.getElementById("password").value;

  if (user === "admin" && pass === "12345") {
    sessionStorage.setItem("loggedIn", "true");
    openDashboard();
  } else {
    document.getElementById("error").textContent =
      "Invalid Username or Password!";
  }
}

function openDashboard() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");
  renderAll();
}

function logout() {
  sessionStorage.removeItem("loggedIn");
  location.reload();
}

// NAVIGATION
function showPage(id) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.add("hidden")
  );

  document.getElementById(id).classList.remove("hidden");

  if (id === "markAttendance") renderMarkTable();
  renderAll();
}

// ADD STUDENT
document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let name = document.getElementById("name").value.trim();
  let roll = document.getElementById("roll").value.trim();
  let course = document.getElementById("course").value.trim();

  if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase())) {
    alert("Roll Number already exists!");
    return;
  }

  students.push({name, roll, course});
  saveData();

  this.reset();
  renderAll();

  alert("Student Added Successfully!");
});

// DELETE STUDENT
function deleteStudent(roll) {
  if (!confirm("Delete this student?")) return;

  students = students.filter(s => s.roll !== roll);
  attendance = attendance.filter(a => a.roll !== roll);

  saveData();
  renderAll();
}

// MARK ATTENDANCE
document.getElementById("attendanceDate").value =
  new Date().toLocaleDateString("en-CA");

function renderMarkTable() {
  let date = document.getElementById("attendanceDate").value;

  document.getElementById("markTable").innerHTML =
    students.map(s => {
      let record = attendance.find(a =>
        a.roll === s.roll && a.date === date
      );

      let status = record ? record.status : "Present";

      return `
        <tr>
          <td>${clean(s.name)}</td>
          <td>${clean(s.roll)}</td>
          <td>
            <select class="status-select" id="status-${encodeURIComponent(s.roll)}">
              <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
              <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
            </select>
          </td>
        </tr>
      `;
    }).join("") || "<tr><td colspan='3'>No students added</td></tr>";
}

document.getElementById("attendanceDate").addEventListener("change", renderMarkTable);

function saveAttendance() {
  let date = document.getElementById("attendanceDate").value;

  if (!date) {
    alert("Please select date!");
    return;
  }

  if (students.length === 0) {
    alert("Please add students first!");
    return;
  }

  students.forEach(s => {
    let select = document.getElementById(
      "status-" + encodeURIComponent(s.roll)
    );

    let status = select.value;

    let existing = attendance.find(a =>
      a.roll === s.roll && a.date === date
    );

    if (existing) {
      existing.status = status;
    } else {
      attendance.push({
        roll: s.roll,
        date: date,
        status: status
      });
    }
  });

  saveData();
  renderAll();
  alert("Attendance Saved Successfully!");
}

// ATTENDANCE REPORT
function renderReport() {
  document.getElementById("reportTable").innerHTML =
    students.map(s => {
      let records = attendance.filter(a => a.roll === s.roll);

      let present = records.filter(a => a.status === "Present").length;
      let absent = records.filter(a => a.status === "Absent").length;

      let total = records.length;
      let percentage = total
        ? ((present / total) * 100).toFixed(1)
        : "0.0";

      return `
        <tr>
          <td>${clean(s.name)}</td>
          <td>${clean(s.roll)}</td>
          <td>${present}</td>
          <td>${absent}</td>
          <td>${percentage}%</td>
        </tr>
      `;
    }).join("") || "<tr><td colspan='5'>No records found</td></tr>";
}

// DASHBOARD AND STUDENT LIST
function renderAll() {
  let today = document.getElementById("attendanceDate").value ||
    new Date().toLocaleDateString("en-CA");

  let todayRecords = attendance.filter(a => a.date === today);

  document.getElementById("totalStudents").textContent = students.length;

  document.getElementById("presentToday").textContent =
    todayRecords.filter(a => a.status === "Present").length;

  document.getElementById("absentToday").textContent =
    todayRecords.filter(a => a.status === "Absent").length;

  let search = document.getElementById("search").value.toLowerCase();

  document.getElementById("studentTable").innerHTML =
    students.filter(s =>
      [s.name, s.roll, s.course].some(v =>
        v.toLowerCase().includes(search)
      )
    ).map(s => `
      <tr>
        <td>${clean(s.name)}</td>
        <td>${clean(s.roll)}</td>
        <td>${clean(s.course)}</td>
        <td>
          <button class="delete" onclick="deleteStudent('${encodeURIComponent(s.roll)}')">
            Delete
          </button>
        </td>
      </tr>
    `).join("") || "<tr><td colspan='4'>No students found</td></tr>";

  renderReport();
}

// INITIALIZE
if (sessionStorage.getItem("loggedIn") === "true") {
  openDashboard();
}
