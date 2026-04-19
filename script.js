// --- 1. CẤU HÌNH API ---
const API_URL = "https://69e4d975cfa9394db8da7144.mockapi.io/tasks"; 

// --- 2. DỮ LIỆU CỐ ĐỊNH ---
// 1. Cập nhật dữ liệu (Bích điền đúng MSSV của các bạn vào nhé)
const team = [
    { name: "Diệu Hân", id: "PS12345", major: "Lập trình Web", role: "Leader | Front-End Developer ", img: "assets/han.jpg" },
    { name: "Ngọc Bích", id: "PS23456", major: "Lập trình Web", role: "Front-End Developer", img: "assets/bich.jpg" },
    { name: "Trọng Tuấn", id: "PS34567", major: "Lập trình Web", role: "Front-End Developer", img: "assets/tuan.png" },
    { name: "Anh Khoa", id: "PS45678", major: "Lập trình Web", role: "Front-End Developer", img: "assets/khoa.jpg" }
];

// 2. Cập nhật hàm render
function renderMembers() {
    const list = document.getElementById('member-list');
    if (!list) return;

    // Render 4 box thành viên
    const membersHtml = team.map(m => `
        <div class="member-card">
            <img src="${m.img}" class="member-avatar">
            <div class="member-info">
                <h3 style="margin: 0; font-size: 17px;">${m.name}</h3>
                <div class="member-id">MSSV: ${m.id}</div>
                <div class="member-major">${m.major}</div>
                <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">${m.role}</p>
            </div>
        </div>
    `).join('');

    // Thêm phần giới thiệu nhóm ở cuối
    const introHtml = `
        <div class="team-intro">
            <h3 style="margin-top:0; color:#1e293b;">🎯 Về NextTech - Nhóm 4</h3>
            <p style="color:#475569; line-height:1.6; font-size: 14px;">
                Chúng mình là những sinh viên chuyên ngành Công nghệ thông tin đến từ trường 
                <strong>FPT Polytechnic</strong>. Với niềm đam mê lập trình và sáng tạo, 
                nhóm 4 được thành lập để cùng nhau thực hiện các dự án web hiện đại, 
                tối ưu trải nghiệm người dùng. "NextTech" thể hiện mong muốn tiếp cận các công nghệ mới nhất.
            </p>
        </div>
    `;

    list.innerHTML = membersHtml + introHtml;
}

const ADMINS = ["Diệu Hân", "Ngọc Bích", "Quản trị viên"];
let currentTaskProofId = null;
let tempSelectedFiles = [];

// Hàm kiểm tra quyền Admin
const isAdmin = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser && ADMINS.some(admin => admin.toLowerCase() === currentUser.toLowerCase().trim());
};

// --- 3. KHỞI TẠO HỆ THỐNG ---
window.onload = async () => {
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
        showTab('project'); 
    } else {
        authBtnContainer.innerHTML = `<a href="login.html" class="btn-login-nav">Đăng nhập</a>`;
        const taskForm = document.querySelector('.task-form-area');
        if (taskForm) {
            taskForm.style.opacity = "0.3";
            taskForm.style.pointerEvents = "none";
        }
    }
    getTasks();
};

window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
};

// --- 4. GIAO TIẾP VỚI MOCKAPI ---

async function getTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        renderBoard(tasks);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
    }
}

window.addTask = async function() {
    const titleInput = document.getElementById('taskTitle');
    const userInput = document.getElementById('taskUser');
    const deadlineInput = document.getElementById('taskDeadline');
    const currentUser = localStorage.getItem('currentUser');

    if (!titleInput.value.trim()) return alert("Vui lòng nhập nội dung công việc!");

    const newTask = {
        title: titleInput.value.trim(),
        user: userInput.value,
        deadline: deadlineInput.value || "Không có hạn",
        status: 'todo',
        feedback: "",
        proofs: [],
        createdBy: currentUser || "Ẩn danh"
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {'content-type':'application/json'},
            body: JSON.stringify(newTask)
        });
        titleInput.value = "";
        deadlineInput.value = "";
        getTasks();
    } catch (err) { alert("Lỗi khi thêm task!"); }
}

window.updateStatus = async function(id, newStatus) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({ status: newStatus })
        });
        getTasks();
    } catch (err) { console.error("Lỗi updateStatus:", err); }
}

window.deleteTask = async function(id) {
    if (confirm("Xóa task này?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        getTasks();
    }
}

// --- 5. XỬ LÝ GIAO DIỆN ---

window.showTab = (tabName) => {
    const projectView = document.getElementById('project-view');
    const membersView = document.getElementById('members-view');
    const breadcrumb = document.getElementById('breadcrumb-name');

    if (tabName === 'members') {
        if (projectView) projectView.style.display = 'none';
        if (membersView) membersView.style.display = 'block';
        if (breadcrumb) breadcrumb.innerText = "Danh sách thành viên";
        renderMembers();
    } else {
        if (projectView) projectView.style.display = 'block';
        if (membersView) membersView.style.display = 'none';
        if (breadcrumb) breadcrumb.innerText = "Quản lý Task Nhóm 4";
        getTasks();
    }
}

function renderBoard(tasks) {
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = "");

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        
        // Sửa lỗi: Đảm bảo click vào card đúng ID
        card.onclick = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IMG') return;
            if (task.status === 'doing') window.openProofModal(task.id);
        };

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h4 style="margin:0;">${task.title}</h4>
                ${isAdmin() ? `<button onclick="deleteTask('${task.id}')" style="background:none; border:none; color:#fb7185; cursor:pointer; font-size:16px;">✕</button>` : ""}
            </div>
            <p style="font-size:10px; color:#94a3b8; margin: 4px 0;">Giao bởi: ${task.createdBy}</p>
            ${task.feedback ? `<p style="color:#e11d48; font-size:12px; background:#ffe4e6; padding:5px; border-radius:5px; margin: 5px 0;">⚠️ ${task.feedback}</p>` : ""}
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:5px; margin: 10px 0;">
                ${(task.proofs || []).map(img => `<img src="${img}" style="width:100%; height:70px; object-fit:cover; border-radius:6px; cursor:pointer;" onclick="window.open('${img}')">`).join('')}
            </div>
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
    if (task.status === 'todo') {
        // Nút để chuyển từ "Mới" sang "Đang thực hiện"
        return `<button class="btn-start" onclick="updateStatus('${task.id}', 'doing')">Bắt đầu</button>`;
    }
    if (task.status === 'doing') {
        // Nút để mở Modal nộp ảnh
        return `
            <button class="btn-submit" onclick="openProofModal('${task.id}')">Nộp bài</button>
            <button class="btn-cancel" onclick="updateStatus('${task.id}', 'todo')" style="background:#64748b; margin-left:5px;">Hủy</button>
        `;
    }
    if (task.status === 'review') {
        if (isAdmin()) {
            return `
                <button class="btn-approve" onclick="updateStatus('${task.id}', 'done')">Duyệt</button>
                <button class="btn-reject" onclick="rejectTask('${task.id}')">Trả lại</button>
            `;
        }
        return `<span style="font-size:12px; color:#f0ad4e;">⏳ Đang chờ duyệt...</span>`;
    }
    return `<span style="color:#5cb85c; font-weight:bold;">✓ Hoàn thành</span>`;
}

// --- 6. XỬ LÝ ẢNH & MODAL ---

// --- 6. XỬ LÝ ẢNH & MODAL ---

window.openProofModal = (id) => {
    currentTaskProofId = id;
    tempSelectedFiles = [];
    const preview = document.getElementById('preview-container');
    const fileInput = document.getElementById('proof-input');
    
    if (preview) preview.innerHTML = "";
    if (fileInput) fileInput.value = ""; // Reset input file để chọn lại ảnh cũ vẫn được
    
    document.getElementById('proof-modal').style.display = 'flex';
    console.log("Đang mở Modal cho Task ID:", id);
};

window.closeProofModal = () => {
    document.getElementById('proof-modal').style.display = 'none';
    currentTaskProofId = null; // Xóa ID tạm để tránh nộp nhầm task
};

// Xử lý nộp ảnh (Dùng sự kiện trực tiếp để ổn định hơn)
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'proof-input') {
        const files = e.target.files;
        const preview = document.getElementById('preview-container');
        if (preview) preview.innerHTML = "";
        tempSelectedFiles = [];

        Array.from(files).forEach(file => {
            // Kiểm tra dung lượng ảnh (MockAPI giới hạn kích thước dữ liệu Base64)
            if (file.size > 500000) { // Giới hạn ~500KB để tránh lỗi server
                alert(`Ảnh ${file.name} quá lớn, hãy chọn ảnh dưới 500KB!`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64Image = ev.target.result;
                tempSelectedFiles.push(base64Image);
                
                const img = document.createElement('img');
                img.src = base64Image;
                img.style.cssText = "width:60px; height:60px; object-fit:cover; margin-right:5px; border-radius:6px; border: 1px solid #ddd;";
                preview?.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Xử lý sự kiện click Xác nhận nộp (Gắn một lần duy nhất)
document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirm-proof-btn');
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            // Kiểm tra các điều kiện trước khi nộp
            if (!currentTaskProofId) return alert("Lỗi: Không tìm thấy ID công việc!");
            if (tempSelectedFiles.length === 0) return alert("Vui lòng chọn ít nhất 1 ảnh minh chứng!");
            
            confirmBtn.disabled = true;
            confirmBtn.innerText = "Đang gửi...";

            try {
                const res = await fetch(`${API_URL}/${currentTaskProofId}`, {
                    method: 'PUT',
                    headers: {'content-type':'application/json'},
                    body: JSON.stringify({ 
                        status: 'review',
                        proofs: tempSelectedFiles,
                        feedback: ""
                    })
                });

                if(res.ok) {
                    alert("Nộp bài thành công! Task đã được chuyển sang Chờ kiểm thử.");
                    closeProofModal();
                    getTasks();
                } else { 
                    const errorMsg = await res.text();
                    console.error("Lỗi server:", errorMsg);
                    alert("Lỗi server (Có thể do ảnh quá nặng)! Hãy thử ảnh nhẹ hơn."); 
                }
            } catch (err) { 
                console.error("Lỗi kết nối:", err);
                alert("Không thể kết nối với server!");
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.innerText = "Xác nhận nộp";
            }
        };
    }
});

window.rejectTask = async function(id) {
    const reason = prompt("Lý do trả lại:");
    if (reason) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({ status: 'doing', feedback: reason, proofs: [] })
        });
        getTasks();
    }
}

// Hàm render lại thành viên theo đúng yêu cầu 4 box hàng ngang
function renderMembers() {
    const list = document.getElementById('member-list');
    if (!list) return;

    const membersHtml = team.map(m => `
        <div class="member-card">
            <img src="${m.img}" class="member-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${m.name}'">
            <div class="member-info">
                <h3 style="margin: 0; font-size: 17px; color: #1e293b;">${m.name}</h3>
                <div class="member-id" style="font-size: 13px; color: #64748b; margin-top: 5px;">MSSV: ${m.id}</div>
                <div class="member-major" style="display: inline-block; font-size: 12px; color: #3b82f6; background: #eff6ff; padding: 2px 8px; border-radius: 4px; margin-top: 5px;">${m.major}</div>
                <p style="margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: 500;">${m.role}</p>
            </div>
        </div>
    `).join('');

    const introHtml = `
        <div class="team-intro" style="grid-column: 1 / -1; background: #f8fafc; padding: 25px; border-radius: 16px; border-left: 5px solid #3b82f6; margin-top: 20px;">
            <h3 style="margin-top:0; color:#1e293b;">🎯 Về NextTech - Team</h3>
            <p style="color:#475569; line-height:1.6; font-size: 14px;">
                Chúng mình là những sinh viên chuyên ngành <strong>${team[0].major}</strong> đến từ trường 
                <strong>FPT Polytechnic</strong>. <br>
                Với niềm đam mê lập trình và sáng tạo, 
                NextTech - Team được thành lập để cùng nhau thực hiện website Quản Lý DATN-2026 nhằm mục đích để theo dõi tiến độ của nhóm.<br>
                Hi vọng nhóm sẽ đạt được thành tích tốt và sẽ vượt qua DATN cuối môn này tốt đẹp.<br>
            </p>
        </div>
    `;

    list.innerHTML = membersHtml + introHtml;
}