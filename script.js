// --- 1. DỮ LIỆU CỐ ĐỊNH ---
const team = [
    { name: "Diệu Hân", role: "Trưởng nhóm / Front-end Developer", img: "https://i.pravatar.cc/150?u=han" },
    { name: "Ngọc Bích", role: "Front-end Developer", img: "https://i.pravatar.cc/150?u=bich" },
    { name: "Trọng Tuấn", role: "Front-end Developer", img: "https://i.pravatar.cc/150?u=tuan" },
    { name: "Anh Khoa", role: "Front-end Developer", img: "https://i.pravatar.cc/150?u=khoa" }
];

const ADMINS = ["Diệu Hân", "Ngọc Bích", "Quản trị viên"];
let tasks = JSON.parse(localStorage.getItem('savedTasks')) || [];
let currentTaskProofId = null;
let tempSelectedFiles = [];

// Hàm kiểm tra quyền Admin
const isAdmin = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser && ADMINS.some(admin => admin.toLowerCase() === currentUser.toLowerCase().trim());
};

// --- 2. KHỞI TẠO HỆ THỐNG ---
(function init() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const authBtnContainer = document.getElementById('auth-buttons');
    const userName = localStorage.getItem('currentUser');

    if (isLoggedIn === 'true' && userName) {
        authBtnContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 14px;">Chào, <strong style="color: #3b82f6;">${userName}</strong> 👋</span>
                <button onclick="logout()" class="btn-logout">Đăng xuất</button>
            </div>
        `;
        showTab('project'); // Mặc định hiện bảng Task
    } else {
        authBtnContainer.innerHTML = `<a href="login.html" class="btn-login-nav">Đăng nhập</a>`;
        const taskForm = document.querySelector('.task-form-area');
        if (taskForm) {
            taskForm.style.opacity = "0.3";
            taskForm.style.pointerEvents = "none";
        }
    }
})();

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function saveToDatabase() {
    localStorage.setItem('savedTasks', JSON.stringify(tasks));
}

// --- 3. XỬ LÝ CHUYỂN TAB (DỰ ÁN / THÀNH VIÊN) ---
function showTab(tabName) {
    const projectView = document.getElementById('project-view');
    const membersView = document.getElementById('members-view');
    const breadcrumb = document.getElementById('breadcrumb-name');
    const iconProject = document.getElementById('icon-project');
    const iconMembers = document.getElementById('icon-members');

    if (tabName === 'members') {
        if (projectView) projectView.style.display = 'none';
        if (membersView) membersView.style.display = 'block';
        if (breadcrumb) breadcrumb.innerText = "Danh sách thành viên";
        if (iconProject) iconProject.classList.remove('active');
        if (iconMembers) iconMembers.classList.add('active');
        renderMembers();
    } else {
        if (projectView) projectView.style.display = 'block';
        if (membersView) membersView.style.display = 'none';
        if (breadcrumb) breadcrumb.innerText = "Quản lý Task Nhóm 4";
        if (iconProject) iconProject.classList.add('active');
        if (iconMembers) iconMembers.classList.remove('active');
        renderBoard();
    }
}

function renderMembers() {
    const list = document.getElementById('member-list');
    if (!list) return;
    list.innerHTML = team.map(m => `
        <div class="member-card" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <img src="${m.img}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
            <div class="member-info">
                <h3 style="margin: 0; font-size: 16px;">${m.name}</h3>
                <p style="margin: 5px 0 0; color: #64748b; font-size: 13px;">${m.role}</p>
            </div>
        </div>
    `).join('');
}

// --- 4. QUẢN LÝ TASK (FIX LỖI GIAO TASK) ---
function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const userInput = document.getElementById('taskUser');
    const deadlineInput = document.getElementById('taskDeadline');
    const currentUser = localStorage.getItem('currentUser');

    if (!titleInput.value.trim()) return alert("Vui lòng nhập nội dung công việc!");

    const newTask = {
        id: Date.now(),
        title: titleInput.value.trim(),
        user: userInput.value,
        deadline: deadlineInput.value || "Không có hạn",
        status: 'todo',
        feedback: "",
        proofs: [],
        createdBy: currentUser || "Ẩn danh"
    };

    tasks.push(newTask);
    saveToDatabase();
    
    // Reset form
    titleInput.value = "";
    deadlineInput.value = "";
    
    renderBoard();
}

function renderBoard() {
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = "");

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        
        card.onclick = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IMG') return;
            if (task.status === 'doing') openProofModal(task.id);
        };

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h4 style="margin:0;">${task.title}</h4>
                ${isAdmin() ? `<button onclick="deleteTask(${task.id})" style="background:none; border:none; color:#fb7185; cursor:pointer; font-size:16px;">✕</button>` : ""}
            </div>
            <p style="font-size:10px; color:#94a3b8; margin: 4px 0;">Giao bởi: ${task.createdBy}</p>
            
            ${task.feedback ? `<p style="color:#e11d48; font-size:12px; background:#ffe4e6; padding:5px; border-radius:5px; margin: 5px 0;">⚠️ ${task.feedback}</p>` : ""}
            
            ${(task.proofs && task.proofs.length > 0) ? `
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:5px; margin: 10px 0;">
                    ${task.proofs.map(img => `<img src="${img}" style="width:100%; height:70px; object-fit:cover; border-radius:6px; cursor:pointer;" onclick="window.open('${img}')">`).join('')}
                </div>
            ` : ""}

            <div class="card-footer" style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                <span class="tag-user">👤 ${task.user}</span>
                <span class="tag-date">⏳ ${task.deadline}</span>
            </div>
            <div class="btn-group" style="margin-top:10px;">${renderButtons(task)}</div>
        `;
        const column = document.querySelector(`#${task.status} .task-list`);
        if (column) column.appendChild(card);
    });
}

function renderButtons(task) {
    if (task.status === 'todo') return `<button onclick="updateStatus(${task.id}, 'doing')">Bắt đầu</button>`;
    if (task.status === 'doing') return `<button onclick="openProofModal(${task.id})">Nộp bài</button>`;
    if (task.status === 'review') {
        if (isAdmin()) {
            return `
                <button class="btn-approve" onclick="updateStatus(${task.id}, 'done')">Duyệt</button>
                <button class="btn-reject" onclick="rejectTask(${task.id})">Trả lại</button>
            `;
        }
        return `<span style="font-size:12px; color:#f0ad4e;">⏳ Chờ duyệt...</span>`;
    }
    return `<span style="color:#5cb85c; font-weight:bold;">✓ Hoàn thành</span>`;
}

// --- 5. MODAL & FILE HANDLING ---
function openProofModal(id) {
    currentTaskProofId = id;
    tempSelectedFiles = [];
    const modal = document.getElementById('proof-modal');
    if (modal) modal.style.display = 'flex';
}

function closeProofModal() {
    const modal = document.getElementById('proof-modal');
    if (modal) modal.style.display = 'none';
}

// Xử lý nộp ảnh
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'proof-input') {
        const files = e.target.files;
        tempSelectedFiles = [];
        const preview = document.getElementById('preview-container');
        if (preview) preview.innerHTML = "";

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                tempSelectedFiles.push(ev.target.result);
                if (preview) {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.cssText = "width:50px; height:50px; object-fit:cover; margin-right:5px; border-radius:4px;";
                    preview.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('confirm-proof-btn');
    if (btn) {
        btn.onclick = () => {
            if (tempSelectedFiles.length === 0) return alert("Vui lòng chọn ảnh!");
            const task = tasks.find(t => t.id === currentTaskProofId);
            if (task) {
                task.status = 'review';
                task.proofs = tempSelectedFiles;
                task.feedback = "";
                saveToDatabase();
                renderBoard();
                closeProofModal();
            }
        };
    }
});

// --- 6. HÀM BỔ TRỢ ---
function updateStatus(id, newStatus) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = newStatus;
        saveToDatabase(); renderBoard();
    }
}

function rejectTask(id) {
    const reason = prompt("Lý do trả lại:");
    if (reason) {
        const task = tasks.find(t => t.id === id);
        task.status = 'doing';
        task.feedback = reason;
        task.proofs = [];
        saveToDatabase(); renderBoard();
    }
}

function deleteTask(id) {
    if (confirm("Xóa task này?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveToDatabase(); renderBoard();
    }
}