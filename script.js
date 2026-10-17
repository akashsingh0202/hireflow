
"use strict";

// ========================================
// HireFlow - Recruitment Dashboard
// ========================================

// 1. DOM ELEMENTS
const candidateForm = document.getElementById("candidate-form");
const candidateTableBody = document.getElementById("candidate-table-body");

const candidateName = document.getElementById("candidate-name");
const candidateEmail = document.getElementById("candidate-email");
const candidateRole = document.getElementById("candidate-role");
const candidateStatus = document.getElementById("candidate-status");
const candidateSkills = document.getElementById("candidate-skills");
const candidateResume = document.getElementById("candidate-resume");
const resumeName = document.getElementById("resume-name");

const globalSearch = document.getElementById("global-search");
const tableSearch = document.getElementById("table-search");
const statusFilter = document.getElementById("status-filter");

const formMessage = document.getElementById("form-message");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");
const resetFormButton = document.getElementById("reset-form");

const logoutButton = document.getElementById("logout-button");
const themeToggle = document.getElementById("theme-toggle");

// 2. STORAGE KEYS
const CANDIDATE_STORAGE_KEY = "hireflow-candidates";
const THEME_STORAGE_KEY = "hireflow-theme";

// 3. APPLICATION STATE
let candidates = [];
let editingCandidateId = null;
let selectedResumeName = "";

// 4. INITIAL DATA
const sampleCandidates = [
    {
        id: "sample-1",
        name: "Riya Sharma",
        email: "riya.sharma@example.com",
        role: "Frontend Developer",
        status: "shortlisted",
        skills: ["HTML", "CSS", "JavaScript"],
        resume: "",
        date: "2026-10-10"
    },
    {
        id: "sample-2",
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        role: "Backend Developer",
        status: "interview",
        skills: ["Python", "SQL", "FastAPI"],
        resume: "",
        date: "2026-10-11"
    },
    {
        id: "sample-3",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        role: "Data Analyst",
        status: "applied",
        skills: ["Python", "NumPy", "Pandas"],
        resume: "",
        date: "2026-10-12"
    },
    {
        id: "sample-4",
        name: "Aman Gupta",
        email: "aman.gupta@example.com",
        role: "UI/UX Designer",
        status: "hired",
        skills: ["Figma", "UI Design"],
        resume: "",
        date: "2026-10-13"
    }
];

// 5. LOAD CANDIDATES
function loadCandidates() {
    try {
        const savedData = localStorage.getItem(CANDIDATE_STORAGE_KEY);

        if (savedData !== null) {
            const parsedData = JSON.parse(savedData);

            candidates = Array.isArray(parsedData)
                ? parsedData
                : [...sampleCandidates];
        } else {
            candidates = [...sampleCandidates];
            saveCandidates();
        }
    } catch (error) {
        console.error("Unable to load candidates:", error);
        candidates = [...sampleCandidates];
    }
}

// 6. SAVE CANDIDATES
function saveCandidates() {
    try {
        localStorage.setItem(
            CANDIDATE_STORAGE_KEY,
            JSON.stringify(candidates)
        );
        return true;
    } catch (error) {
        console.error("Unable to save candidates:", error);
        showMessage(
            "Could not save data. Your browser storage may be full.",
            "error"
        );
        return false;
    }
}

// 7. GENERATE UNIQUE ID
function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

// 8. FORMAT STATUS
function formatStatus(status) {
    const statusLabels = {
        applied: "Applied",
        shortlisted: "Shortlisted",
        interview: "Interview",
        hired: "Hired",
        rejected: "Rejected"
    };

    return statusLabels[status] || "Applied";
}

// 9. FORMAT DATE
function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// 10. SHOW MESSAGE
function showMessage(message, type = "success") {
    if (!formMessage) {
        return;
    }

    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}

// 11. CREATE SAFE TEXT ELEMENT
function createTextElement(tagName, text, className = "") {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// 12. CREATE STATUS BADGE
function createStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = "status-badge status-" + status;
    badge.textContent = formatStatus(status);

    return badge;
}

// 13. CREATE CANDIDATE ROW
function createCandidateRow(candidate) {
    const row = document.createElement("tr");

    // Candidate information
    const candidateCell = document.createElement("td");
    const candidateInfo = document.createElement("div");
    candidateInfo.className = "candidate-info";

    const initials = candidate.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");

    const avatar = createTextElement("span", initials, "candidate-avatar");

    const details = document.createElement("div");
    details.className = "candidate-details";

    details.appendChild(
        createTextElement("strong", candidate.name)
    );

    details.appendChild(
        createTextElement("small", candidate.email)
    );

    candidateInfo.append(avatar, details);
    candidateCell.appendChild(candidateInfo);

    // Applied role
    const roleCell = createTextElement("td", candidate.role);

    // Application date
    const dateCell = createTextElement(
        "td",
        formatDate(candidate.date)
    );

    // Status
    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusBadge(candidate.status));

    // Actions
    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "candidate-actions";

    const editButton = createTextElement(
        "button",
        "Edit",
        "button small secondary"
    );

    editButton.type = "button";
    editButton.setAttribute(
        "aria-label",
        "Edit " + candidate.name
    );

    editButton.addEventListener("click", function () {
        editCandidate(candidate.id);
    });

    const deleteButton = createTextElement(
        "button",
        "Delete",
        "button small danger"
    );

    deleteButton.type = "button";
    deleteButton.setAttribute(
        "aria-label",
        "Delete " + candidate.name
    );

    deleteButton.addEventListener("click", function () {
        deleteCandidate(candidate.id);
    });

    actions.append(editButton, deleteButton);
    actionsCell.appendChild(actions);

    row.append(
        candidateCell,
        roleCell,
        dateCell,
        statusCell,
        actionsCell
    );

    return row;
}

// 14. RENDER CANDIDATES
function renderCandidates() {
    if (!candidateTableBody) {
        return;
    }

    const searchTerm = (
        tableSearch?.value ||
        globalSearch?.value ||
        ""
    ).trim().toLowerCase();

    const selectedStatus = statusFilter?.value || "all";

    const filteredCandidates = candidates.filter(function (candidate) {
        const searchableText = [
            candidate.name,
            candidate.email,
            candidate.role,
            ...(candidate.skills || [])
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            candidate.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    candidateTableBody.replaceChildren();

    if (filteredCandidates.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-state";
        cell.textContent = "No candidates found. Try another search or add a candidate.";

        row.appendChild(cell);
        candidateTableBody.appendChild(row);
    } else {
        filteredCandidates.forEach(function (candidate) {
            candidateTableBody.appendChild(
                createCandidateRow(candidate)
            );
        });
    }

    const recordCount = document.getElementById("record-count");

    if (recordCount) {
        recordCount.textContent =
            filteredCandidates.length +
            (filteredCandidates.length === 1
                ? " candidate"
                : " candidates");
    }

    updateDashboardStats();
}

// 15. UPDATE DASHBOARD STATISTICS
function updateDashboardStats() {
    const total = candidates.length;

    const countByStatus = function (status) {
        return candidates.filter(
            candidate => candidate.status === status
        ).length;
    };

    const setText = function (id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = String(value);
        }
    };

    setText("stat-total", total);
    setText("stat-interviews", countByStatus("interview"));
    setText("stat-hired", countByStatus("hired"));

    setText("count-applied", countByStatus("applied"));
    setText("count-shortlisted", countByStatus("shortlisted"));
    setText("count-interview", countByStatus("interview"));
    setText("count-hired", countByStatus("hired"));
    setText("count-rejected", countByStatus("rejected"));
}

// 16. RESET FORM
function resetCandidateForm() {
    if (!candidateForm) {
        return;
    }

    candidateForm.reset();

    editingCandidateId = null;
    selectedResumeName = "";

    if (formTitle) {
        formTitle.textContent = "Add a Candidate";
    }

    if (submitButton) {
        submitButton.textContent = "+ Add Candidate";
    }

    if (cancelEditButton) {
        cancelEditButton.hidden = true;
    }

    if (resumeName) {
        resumeName.textContent = "No resume selected";
    }

    if (candidateResume) {
        candidateResume.value = "";
    }

    showMessage("");
}

// 17. ADD OR UPDATE CANDIDATE
function handleCandidateSubmit(event) {
    event.preventDefault();

    const name = candidateName.value.trim();
    const email = candidateEmail.value.trim().toLowerCase();
    const role = candidateRole.value;
    const status = candidateStatus.value;

    const skills = candidateSkills.value
        .split(",")
        .map(skill => skill.trim())
        .filter(Boolean);

    if (!name || !email || !role || !status) {
        showMessage("Please complete all required fields.", "error");
        return;
    }

    const duplicateEmail = candidates.some(function (candidate) {
        return (
            candidate.email.toLowerCase() === email &&
            candidate.id !== editingCandidateId
        );
    });

    if (duplicateEmail) {
        showMessage(
            "A candidate with this email already exists.",
            "error"
        );
        return;
    }

    const existingCandidate = editingCandidateId
        ? candidates.find(candidate => candidate.id === editingCandidateId)
        : null;

    const candidate = {
        id: editingCandidateId || generateId(),
        name,
        email,
        role,
        status,
        skills,
        resume: selectedResumeName ||
            existingCandidate?.resume ||
            "",
        date: existingCandidate?.date ||
            new Date().toISOString().slice(0, 10)
    };

    if (editingCandidateId) {
        const index = candidates.findIndex(
            item => item.id === editingCandidateId
        );

        if (index !== -1) {
            candidates[index] = candidate;
        }
    } else {
        candidates.unshift(candidate);
    }

    if (!saveCandidates()) {
        return;
    }

    const wasEditing = Boolean(editingCandidateId);

    resetCandidateForm();
    renderCandidates();

    showMessage(
        wasEditing
            ? "Candidate updated successfully."
            : "Candidate added successfully.",
        "success"
    );

    document.getElementById("candidates")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// 18. EDIT CANDIDATE
function editCandidate(id) {
    const candidate = candidates.find(item => item.id === id);

    if (!candidate) {
        showMessage("Candidate not found.", "error");
        return;
    }

    editingCandidateId = id;

    candidateName.value = candidate.name;
    candidateEmail.value = candidate.email;
    candidateRole.value = candidate.role;
    candidateStatus.value = candidate.status;
    candidateSkills.value = (candidate.skills || []).join(", ");

    selectedResumeName = candidate.resume || "";

    if (resumeName) {
        resumeName.textContent =
            selectedResumeName || "No new resume selected";
    }

    if (formTitle) {
        formTitle.textContent = "Edit Candidate";
    }

    if (submitButton) {
        submitButton.textContent = "Save Changes";
    }

    if (cancelEditButton) {
        cancelEditButton.hidden = false;
    }

    showMessage("Update the details and select Save Changes.");

    document.getElementById("add-candidate")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// 19. DELETE CANDIDATE
function deleteCandidate(id) {
    const candidate = candidates.find(item => item.id === id);

    if (!candidate) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete " + candidate.name + "?"
    );

    if (!confirmed) {
        return;
    }

    candidates = candidates.filter(item => item.id !== id);

    if (!saveCandidates()) {
        return;
    }

    if (editingCandidateId === id) {
        resetCandidateForm();
    }

    renderCandidates();
}

// 20. RESUME VALIDATION
function handleResumeChange() {
    const file = candidateResume?.files?.[0];

    if (!file) {
        selectedResumeName = "";

        if (resumeName) {
            resumeName.textContent = "No resume selected";
        }

        return;
    }

    const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
        candidateResume.value = "";
        selectedResumeName = "";

        if (resumeName) {
            resumeName.textContent = "No resume selected";
        }

        showMessage("Please select a PDF resume.", "error");
        return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        candidateResume.value = "";
        selectedResumeName = "";

        if (resumeName) {
            resumeName.textContent = "No resume selected";
        }

        showMessage("Resume must be smaller than 5 MB.", "error");
        return;
    }

    selectedResumeName = file.name;

    if (resumeName) {
        resumeName.textContent = file.name;
    }

    showMessage("Resume selected successfully.");
}

// 21. GLOBAL SEARCH
function handleGlobalSearch() {
    if (tableSearch && globalSearch) {
        tableSearch.value = globalSearch.value;
    }

    renderCandidates();

    document.getElementById("candidates")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// 22. TABLE SEARCH
function handleTableSearch() {
    if (globalSearch && tableSearch) {
        globalSearch.value = tableSearch.value;
    }

    renderCandidates();
}

// 23. LOGOUT
function logout() {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) {
        return;
    }

    sessionStorage.removeItem("hireflow-demo-login");
    sessionStorage.removeItem("hireflow-current-user");

    window.location.href = "login.html";
}

// 24. SHOW LOGGED-IN USER
function displayCurrentUser() {
    let user = null;

    try {
        user = JSON.parse(
            sessionStorage.getItem("hireflow-current-user") || "null"
        );
    } catch (error) {
        user = null;
    }

    if (!user) {
        return;
    }

    const name = user.name || "User";
    const profileName = document.getElementById("profile-name");
    const welcomeName = document.getElementById("welcome-name");
    const profileAvatar = document.getElementById("profile-avatar");

    if (profileName) {
        profileName.textContent = name;
    }

    if (welcomeName) {
        welcomeName.textContent = name.split(" ")[0];
    }

    if (profileAvatar) {
        profileAvatar.textContent = name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("");
    }
}

// 25. THEME TOGGLE
function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");

    if (themeToggle) {
        themeToggle.textContent = theme === "dark" ? "☀" : "☾";
        themeToggle.setAttribute(
            "aria-label",
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
        console.warn("Theme preference could not be saved.");
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
        applyTheme(savedTheme);
    } catch (error) {
        applyTheme("light");
    }
}

// 26. EVENT LISTENERS
if (candidateForm) {
    candidateForm.addEventListener("submit", handleCandidateSubmit);
}

if (candidateResume) {
    candidateResume.addEventListener("change", handleResumeChange);
}

if (tableSearch) {
    tableSearch.addEventListener("input", handleTableSearch);
}

if (globalSearch) {
    globalSearch.addEventListener("input", handleGlobalSearch);
}

if (statusFilter) {
    statusFilter.addEventListener("change", renderCandidates);
}

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", resetCandidateForm);
}

if (resetFormButton) {
    resetFormButton.addEventListener("click", function () {
        setTimeout(function () {
            editingCandidateId = null;
            selectedResumeName = "";

            if (formTitle) {
                formTitle.textContent = "Add a Candidate";
            }

            if (submitButton) {
                submitButton.textContent = "+ Add Candidate";
            }

            if (cancelEditButton) {
                cancelEditButton.hidden = true;
            }

            if (resumeName) {
                resumeName.textContent = "No resume selected";
            }

            showMessage("");
        }, 0);
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

// 27. INITIALIZE APPLICATION
function initializeHireFlow() {
    loadCandidates();
    loadTheme();
    displayCurrentUser();
    renderCandidates();

    console.log("HireFlow initialized successfully!");
}

initializeHireFlow();
