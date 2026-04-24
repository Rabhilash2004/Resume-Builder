/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

const API = "/api/resumes";

let user = JSON.parse(localStorage.getItem("resume_user") || "null");
if (!user) {
  location.href = "login.html";
}

let state = {
  resumeId: null,
  title: "My Resume",
  templateName: "modern",
  data: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    summary: "",
    skills: ["Java", "Spring Boot", "HTML", "CSS"],
    experience: [
      { role: "", company: "", duration: "", location: "", description: "" }
    ],
    education: [
      { degree: "", institution: "", year: "", description: "" }
    ],
    projects: [
      { name: "", stack: "", description: "" }
    ],
    certifications: [
      { name: "", issuer: "", year: "" }
    ]
  }
};

function init() {
  bindSimpleInputs();
  renderAllRepeaters();
  applyTemplate();
  applyStyle();
  loadDraft();
  loadExistingResume();
  updatePreview();
  updateProgress();
}

function bindSimpleInputs() {
  const ids = ["fullName","title","email","phone","location","website","linkedin","summary"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    el.value = state.data[id] || "";
    el.addEventListener("input", () => {
      state.data[id] = el.value;
      autosaveDraft();
      updatePreview();
      updateProgress();
    });
  });
}

function applyTemplate() {
  state.templateName = document.getElementById("templateSelect").value;
  const sheet = document.getElementById("previewSheet").querySelector(".resume-sheet");
  sheet.classList.remove("modern", "classic");
  sheet.classList.add(state.templateName);
  autosaveDraft();
}

function applyStyle() {
  const accent = document.getElementById("accent").value;
  const fontSize = document.getElementById("fontSize").value;
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-dark", accent);
  document.querySelector(".resume-sheet").style.fontSize = fontSize + "px";
  autosaveDraft();
}

function saveDraftToStorage() {
  localStorage.setItem("resume_draft", JSON.stringify(state));
  document.getElementById("autosaveText").textContent = "Draft saved locally";
}

function autosaveDraft() {
  clearTimeout(window.__draftTimer);
  window.__draftTimer = setTimeout(saveDraftToStorage, 250);
}

function loadDraft() {
  const draft = localStorage.getItem("resume_draft");
  if (!draft) return;
  try {
    const saved = JSON.parse(draft);
    state = { ...state, ...saved, data: { ...state.data, ...(saved.data || {}) } };

    ["fullName","title","email","phone","location","website","linkedin","summary"].forEach(id => {
      const el = document.getElementById(id);
      el.value = state.data[id] || "";
    });

    document.getElementById("templateSelect").value = state.templateName || "modern";
    if (saved.data && saved.data.skills) state.data.skills = saved.data.skills;
    if (saved.data && saved.data.experience) state.data.experience = saved.data.experience;
    if (saved.data && saved.data.education) state.data.education = saved.data.education;
    if (saved.data && saved.data.projects) state.data.projects = saved.data.projects;
    if (saved.data && saved.data.certifications) state.data.certifications = saved.data.certifications;

    renderAllRepeaters();
  } catch (e) {}
}

async function loadExistingResume() {
  try {
    const res = await fetch(`${API}/user/${user.id}`);
    if (!res.ok) return;
    const list = await res.json();
    if (!list.length) return;

    const latest = list[0];
    state.resumeId = latest.id;
    state.title = latest.title || "My Resume";
    state.templateName = latest.templateName || "modern";

    const data = JSON.parse(latest.dataJson || "{}");
    state.data = { ...state.data, ...data };

    document.getElementById("templateSelect").value = state.templateName;
    document.getElementById("fullName").value = state.data.fullName || "";
    document.getElementById("title").value = state.data.title || "";
    document.getElementById("email").value = state.data.email || "";
    document.getElementById("phone").value = state.data.phone || "";
    document.getElementById("location").value = state.data.location || "";
    document.getElementById("website").value = state.data.website || "";
    document.getElementById("linkedin").value = state.data.linkedin || "";
    document.getElementById("summary").value = state.data.summary || "";

    renderAllRepeaters();
    updatePreview();
    updateProgress();
  } catch (e) {
    console.log(e);
  }
}

function renderAllRepeaters() {
  renderSkills();
  renderExperience();
  renderEducation();
  renderProjects();
  renderCertifications();
}

function renderSkills() {
  const box = document.getElementById("skillsList");
  box.innerHTML = "";
  state.data.skills.forEach((skill, index) => {
    const div = document.createElement("div");
    div.className = "repeat-item";
    div.innerHTML = `
      <div class="repeat-head">
        <strong>Skill ${index + 1}</strong>
        <button class="remove-btn" onclick="removeSkill(${index})">Remove</button>
      </div>
      <input class="small-input" value="${escapeHtml(skill)}" placeholder="Skill name" oninput="updateSkill(${index}, this.value)">
    `;
    box.appendChild(div);
  });
}

function renderExperience() {
  const box = document.getElementById("experienceList");
  box.innerHTML = "";
  state.data.experience.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "repeat-item";
    div.innerHTML = `
      <div class="repeat-head">
        <strong>Experience ${index + 1}</strong>
        <button class="remove-btn" onclick="removeExperience(${index})">Remove</button>
      </div>
      <div class="repeat-grid">
        <input class="small-input" value="${escapeHtml(item.role || "")}" placeholder="Role" oninput="updateExperience(${index}, 'role', this.value)">
        <input class="small-input" value="${escapeHtml(item.company || "")}" placeholder="Company" oninput="updateExperience(${index}, 'company', this.value)">
        <div class="repeat-grid two">
          <input class="small-input" value="${escapeHtml(item.duration || "")}" placeholder="Duration" oninput="updateExperience(${index}, 'duration', this.value)">
          <input class="small-input" value="${escapeHtml(item.location || "")}" placeholder="Location" oninput="updateExperience(${index}, 'location', this.value)">
        </div>
        <textarea class="small-textarea" placeholder="Description" oninput="updateExperience(${index}, 'description', this.value)">${escapeHtml(item.description || "")}</textarea>
      </div>
    `;
    box.appendChild(div);
  });
}

function renderEducation() {
  const box = document.getElementById("educationList");
  box.innerHTML = "";
  state.data.education.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "repeat-item";
    div.innerHTML = `
      <div class="repeat-head">
        <strong>Education ${index + 1}</strong>
        <button class="remove-btn" onclick="removeEducation(${index})">Remove</button>
      </div>
      <div class="repeat-grid">
        <input class="small-input" value="${escapeHtml(item.degree || "")}" placeholder="Degree / Course" oninput="updateEducation(${index}, 'degree', this.value)">
        <input class="small-input" value="${escapeHtml(item.institution || "")}" placeholder="Institution" oninput="updateEducation(${index}, 'institution', this.value)">
        <div class="repeat-grid two">
          <input class="small-input" value="${escapeHtml(item.year || "")}" placeholder="Year" oninput="updateEducation(${index}, 'year', this.value)">
          <input class="small-input" value="${escapeHtml(item.description || "")}" placeholder="Details" oninput="updateEducation(${index}, 'description', this.value)">
        </div>
      </div>
    `;
    box.appendChild(div);
  });
}

function renderProjects() {
  const box = document.getElementById("projectsList");
  box.innerHTML = "";
  state.data.projects.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "repeat-item";
    div.innerHTML = `
      <div class="repeat-head">
        <strong>Project ${index + 1}</strong>
        <button class="remove-btn" onclick="removeProject(${index})">Remove</button>
      </div>
      <div class="repeat-grid">
        <input class="small-input" value="${escapeHtml(item.name || "")}" placeholder="Project name" oninput="updateProject(${index}, 'name', this.value)">
        <input class="small-input" value="${escapeHtml(item.stack || "")}" placeholder="Tech stack" oninput="updateProject(${index}, 'stack', this.value)">
        <textarea class="small-textarea" placeholder="Project description" oninput="updateProject(${index}, 'description', this.value)">${escapeHtml(item.description || "")}</textarea>
      </div>
    `;
    box.appendChild(div);
  });
}

function renderCertifications() {
  const box = document.getElementById("certList");
  box.innerHTML = "";
  state.data.certifications.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "repeat-item";
    div.innerHTML = `
      <div class="repeat-head">
        <strong>Certification ${index + 1}</strong>
        <button class="remove-btn" onclick="removeCertification(${index})">Remove</button>
      </div>
      <div class="repeat-grid">
        <input class="small-input" value="${escapeHtml(item.name || "")}" placeholder="Certification name" oninput="updateCertification(${index}, 'name', this.value)">
        <div class="repeat-grid two">
          <input class="small-input" value="${escapeHtml(item.issuer || "")}" placeholder="Issuer" oninput="updateCertification(${index}, 'issuer', this.value)">
          <input class="small-input" value="${escapeHtml(item.year || "")}" placeholder="Year" oninput="updateCertification(${index}, 'year', this.value)">
        </div>
      </div>
    `;
    box.appendChild(div);
  });
}

function addSkill() {
  state.data.skills.push("");
  renderSkills();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function addExperience() {
  state.data.experience.push({ role: "", company: "", duration: "", location: "", description: "" });
  renderExperience();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function addEducation() {
  state.data.education.push({ degree: "", institution: "", year: "", description: "" });
  renderEducation();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function addProject() {
  state.data.projects.push({ name: "", stack: "", description: "" });
  renderProjects();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function addCertification() {
  state.data.certifications.push({ name: "", issuer: "", year: "" });
  renderCertifications();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function removeSkill(i) { state.data.skills.splice(i, 1); renderSkills(); updatePreview(); updateProgress(); autosaveDraft(); }
function removeExperience(i) { state.data.experience.splice(i, 1); renderExperience(); updatePreview(); updateProgress(); autosaveDraft(); }
function removeEducation(i) { state.data.education.splice(i, 1); renderEducation(); updatePreview(); updateProgress(); autosaveDraft(); }
function removeProject(i) { state.data.projects.splice(i, 1); renderProjects(); updatePreview(); updateProgress(); autosaveDraft(); }
function removeCertification(i) { state.data.certifications.splice(i, 1); renderCertifications(); updatePreview(); updateProgress(); autosaveDraft(); }

function updateSkill(i, value) { state.data.skills[i] = value; updatePreview(); updateProgress(); autosaveDraft(); }
function updateExperience(i, key, value) { state.data.experience[i][key] = value; updatePreview(); updateProgress(); autosaveDraft(); }
function updateEducation(i, key, value) { state.data.education[i][key] = value; updatePreview(); updateProgress(); autosaveDraft(); }
function updateProject(i, key, value) { state.data.projects[i][key] = value; updatePreview(); updateProgress(); autosaveDraft(); }
function updateCertification(i, key, value) { state.data.certifications[i][key] = value; updatePreview(); updateProgress(); autosaveDraft(); }

function updatePreview() {
  document.getElementById("pFullName").textContent = state.data.fullName || "Your Name";
  document.getElementById("pTitle").textContent = state.data.title || "Professional Title";
  document.getElementById("pEmail").textContent = state.data.email || "email@example.com";
  document.getElementById("pPhone").textContent = state.data.phone || "+91 00000 00000";
  document.getElementById("pLocation").textContent = state.data.location || "Location";
  document.getElementById("pWebsite").textContent = state.data.website || "Website";
  document.getElementById("pLinkedin").textContent = state.data.linkedin || "LinkedIn";
  document.getElementById("pSummary").textContent = state.data.summary || "Write your summary here.";

  const skills = document.getElementById("pSkills");
  skills.innerHTML = state.data.skills
    .filter(Boolean)
    .map(skill => `<span class="chip">${escapeHtml(skill)}</span>`)
    .join("");

  const exp = document.getElementById("pExperience");
  exp.innerHTML = state.data.experience.map(item => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(item.role || "Role")}</div>
      <div class="entry-sub">${escapeHtml(item.company || "Company")} | ${escapeHtml(item.duration || "Duration")} | ${escapeHtml(item.location || "Location")}</div>
      <div class="entry-desc">${escapeHtml(item.description || "")}</div>
    </div>
  `).join("");

  const edu = document.getElementById("pEducation");
  edu.innerHTML = state.data.education.map(item => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(item.degree || "Degree")}</div>
      <div class="entry-sub">${escapeHtml(item.institution || "Institution")} | ${escapeHtml(item.year || "Year")}</div>
      <div class="entry-desc">${escapeHtml(item.description || "")}</div>
    </div>
  `).join("");

  const proj = document.getElementById("pProjects");
  proj.innerHTML = state.data.projects.map(item => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(item.name || "Project")}</div>
      <div class="entry-sub">${escapeHtml(item.stack || "Tech Stack")}</div>
      <div class="entry-desc">${escapeHtml(item.description || "")}</div>
    </div>
  `).join("");

  const cert = document.getElementById("pCertifications");
  cert.innerHTML = state.data.certifications.map(item => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(item.name || "Certification")}</div>
      <div class="entry-sub">${escapeHtml(item.issuer || "Issuer")} | ${escapeHtml(item.year || "Year")}</div>
    </div>
  `).join("");

  applyTemplate();
  applyStyle();
}

function updateProgress() {
  let filled = 0;
  const checks = [
    state.data.fullName,
    state.data.title,
    state.data.email,
    state.data.phone,
    state.data.summary,
    state.data.skills.some(Boolean),
    state.data.experience.some(x => x.role || x.company || x.description),
    state.data.education.some(x => x.degree || x.institution),
    state.data.projects.some(x => x.name || x.description),
    state.data.certifications.some(x => x.name || x.issuer)
  ];

  checks.forEach(v => { if (v) filled++; });
  const percent = Math.round((filled / checks.length) * 100);

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").textContent = percent + "%";
}

async function saveResume() {
  try {
    const payload = {
      id: state.resumeId,
      userId: user.id,
      title: state.data.fullName ? `${state.data.fullName} Resume` : "My Resume",
      templateName: state.templateName,
      dataJson: JSON.stringify(state.data)
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    state.resumeId = result.id;
    document.getElementById("autosaveText").textContent = "Saved to server";
    saveDraftToStorage();
    alert("Resume saved successfully");
  } catch (e) {
    alert("Save failed");
  }
}

async function downloadPdf() {
  try {
    if (!state.resumeId) {
      await saveResume();
    }

    const res = await fetch(`${API}/${state.resumeId}/pdf`);
    if (!res.ok) {
      alert("PDF generation failed");
      return;
    }

    const blob = await res.blob();
    const fileName = `${(state.data.fullName || "resume").replace(/\s+/g, "_")}.pdf`;

    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: "PDF file",
          accept: { "application/pdf": [".pdf"] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  } catch (e) {
    alert("Download cancelled or failed");
  }
}

function logout() {
  localStorage.removeItem("resume_user");
  localStorage.removeItem("resume_draft");
  location.href = "login.html";
}

function clearAll() {
  if (!confirm("Clear everything?")) return;

  state.data = {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    summary: "",
    skills: [""],
    experience: [{ role: "", company: "", duration: "", location: "", description: "" }],
    education: [{ degree: "", institution: "", year: "", description: "" }],
    projects: [{ name: "", stack: "", description: "" }],
    certifications: [{ name: "", issuer: "", year: "" }]
  };

  ["fullName","title","email","phone","location","website","linkedin","summary"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("templateSelect").value = "modern";
  renderAllRepeaters();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function fillSample() {
  state.data = {
    fullName: "Your Name",
    title: "Java Spring Boot Developer",
    email: "your.email@example.com",
    phone: "+91 98765 43210",
    location: "India",
    website: "portfolio.example.com",
    linkedin: "linkedin.com/in/yourprofile",
    summary: "Entry-level developer with strong interest in backend systems, UI design, and building real-world applications using Java, Spring Boot, HTML, CSS, and JavaScript.",
    skills: ["Java", "Spring Boot", "MySQL", "HTML", "CSS", "JavaScript", "REST APIs"],
    experience: [
      {
        role: "Intern / Trainee",
        company: "Company Name",
        duration: "2025",
        location: "Remote",
        description: "Worked on CRUD modules, UI enhancements, and API integration."
      }
    ],
    education: [
      {
        degree: "B.E. / B.Tech in Computer Science",
        institution: "Your College",
        year: "2022 - 2026",
        description: "CGPA: 8.2"
      }
    ],
    projects: [
      {
        name: "Resume Builder Premium",
        stack: "Spring Boot, MySQL, HTML, CSS, JS",
        description: "A modern resume builder with live preview, PDF export, authentication, and template switching."
      }
    ],
    certifications: [
      { name: "Java Full Stack Basics", issuer: "Online Platform", year: "2025" }
    ]
  };

  ["fullName","title","email","phone","location","website","linkedin","summary"].forEach(id => {
    document.getElementById(id).value = state.data[id];
  });

  renderAllRepeaters();
  updatePreview();
  updateProgress();
  autosaveDraft();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
