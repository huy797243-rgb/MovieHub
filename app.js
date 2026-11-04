let movies = [];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load(){ const r=await fetch("/api/movies"); movies=await r.json(); render(); }
function card(m){return `<article class="movie" data-id="${esc(m.id)}"><img class="poster" src="${esc(m.poster||"")}" onerror="this.style.visibility='hidden'" alt="${esc(m.title)}"><h3>${esc(m.title)}</h3><div class="movie-meta">${esc(m.year||"")} · ${esc(m.genre||"")}</div><span class="tag">${esc(m.type||"Phim lẻ")}</span></article>`}
function render(){
 const q=$("#search").value.toLowerCase().trim(), g=$("#genre").value;
 const list=movies.filter(m=>(!q||m.title.toLowerCase().includes(q))&&(!g||m.genre===g));
 $("#count").textContent=`${list.length} nội dung`;
 $("#featured").innerHTML=movies.filter(m=>m.featured && (!q||m.title.toLowerCase().includes(q)) && (!g||m.genre===g)).map(card).join("")||'<p class="empty">Chưa có phim nổi bật phù hợp.</p>';
 $("#allMovies").innerHTML=list.map(card).join("")||'<p class="empty">Không tìm thấy phim phù hợp.</p>';
 document.querySelectorAll(".movie").forEach(el=>el.addEventListener("click",()=>showDetail(el.dataset.id)));
}
function showDetail(id){
 const m=movies.find(x=>x.id===id); if(!m)return;
 const play=m.playUrl ? `<a class="watch" href="${esc(m.playUrl)}" target="_blank" rel="noopener">▶ Xem phim</a>` : `<p class="hint">Chưa có nguồn phát được cấp phép. Bạn có thể xem trailer hoặc liên hệ quản trị viên để cập nhật.</p>`;
 const trailer=m.trailerUrl?`<a class="secondary" href="${esc(m.trailerUrl)}" target="_blank" rel="noopener">Xem trailer</a>`:"";
 $("#detailBody").innerHTML=`<div class="detail-layout"><img src="${esc(m.poster)}" alt=""><div><span class="eyebrow">${esc(m.type||"PHIM")}</span><h2>${esc(m.title)}</h2><div class="movie-meta">${esc(m.year)} · ${esc(m.genre)} · ★ ${esc(m.rating||"—")}</div><p>${esc(m.description||"Đang cập nhật nội dung.")}</p>${play} ${trailer}</div></div>`;
 $("#detail").classList.add("show");
}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.remove("show"));
["detail","admin"].forEach(id=>$("#"+id).addEventListener("click",e=>{if(e.target.id===id)e.target.classList.remove("show")}));
$("#search").addEventListener("input",render); $("#genre").addEventListener("change",render);
$("#adminOpen").onclick=openAdmin;
async function openAdmin(){
 $("#admin").classList.add("show");
 const s=await fetch("/api/session").then(r=>r.json());
 if(!s.loggedIn){ $("#adminBody").innerHTML=`<h2>Đăng nhập quản trị</h2><p class="hint">Chỉ quản trị viên mới có thể thêm, sửa hoặc xóa nội dung.</p><form id="loginForm"><div class="field"><label>Tên đăng nhập</label><input name="username" required value="admin"></div><div class="field"><label>Mật khẩu</label><input name="password" type="password" required></div><button class="action">Đăng nhập</button><p id="loginError" class="hint"></p></form>`; $("#loginForm").onsubmit=login; }
 else renderAdmin();
}
async function login(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(!r.ok){$("#loginError").textContent="Thông tin đăng nhập chưa chính xác.";return;}renderAdmin();}
function renderAdmin(){
 $("#adminBody").innerHTML=`<h2>Quản trị MovieHub</h2><p class="hint">Xin chào quản trị viên. Chỉ nhập đường dẫn phát mà bạn có quyền sử dụng.</p><form id="movieForm"><input type="hidden" name="id"><div class="form-grid">
 <div class="field"><label>Tên phim *</label><input name="title" required></div><div class="field"><label>Năm phát hành</label><input name="year" type="number" value="2026"></div>
 <div class="field"><label>Thể loại *</label><select name="genre"><option>Hành động</option><option>Tình cảm</option><option>Khoa học viễn tưởng</option><option>Hoạt hình</option><option>Chính kịch</option><option>Kỳ bí</option><option>Giật gân</option><option>Kinh dị</option></select></div><div class="field"><label>Định dạng</label><select name="type"><option>Phim lẻ</option><option>Phim bộ</option></select></div>
 <div class="field full"><label>Link ảnh poster</label><input name="poster" placeholder="https://..."></div><div class="field full"><label>Link phát phim có bản quyền</label><input name="playUrl" placeholder="https://..."></div>
 <div class="field full"><label>Link trailer</label><input name="trailerUrl" placeholder="https://..."></div><div class="field full"><label>Mô tả</label><textarea name="description"></textarea></div>
 <div class="field"><label>Điểm đánh giá</label><input name="rating" placeholder="8.5"></div><div class="field"><label><input name="featured" type="checkbox" style="width:auto"> Hiển thị nổi bật</label></div></div><button class="action">Lưu phim</button> <button type="button" class="outline" id="resetForm">Làm mới</button></form><div class="admin-list"><h3>Danh sách nội dung (${movies.length})</h3>${movies.map(m=>`<div class="admin-row"><img src="${esc(m.poster)}" onerror="this.style.visibility='hidden'"><span><b>${esc(m.title)}</b><br><small>${esc(m.year)} · ${esc(m.genre)}</small></span><button data-edit="${esc(m.id)}">Sửa</button><button data-del="${esc(m.id)}">Xóa</button></div>`).join("")}</div><p style="text-align:right"><button id="logout" class="outline">Đăng xuất</button></p>`;
 $("#movieForm").onsubmit=saveMovie; $("#resetForm").onclick=()=>$("#movieForm").reset();
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editMovie(b.dataset.edit));
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteMovie(b.dataset.del));
 $("#logout").onclick=async()=>{await fetch("/api/logout",{method:"POST"});openAdmin();};
}
function editMovie(id){const m=movies.find(x=>x.id===id);const f=$("#movieForm");Object.keys(m).forEach(k=>{if(f.elements[k]){if(k==="featured")f.elements[k].checked=!!m[k];else f.elements[k].value=m[k]??"";}});f.scrollIntoView({behavior:"smooth"});}
async function saveMovie(e){e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f));d.featured=f.elements.featured.checked;d.year=Number(d.year)||new Date().getFullYear();const id=d.id;delete d.id;const r=await fetch(id?"/api/movies/"+encodeURIComponent(id):"/api/movies",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});if(!r.ok){alert("Không thể lưu. Vui lòng đăng nhập lại.");return;}f.reset();await load();renderAdmin();}
async function deleteMovie(id){if(!confirm("Bạn chắc chắn muốn xóa phim này?"))return;const r=await fetch("/api/movies/"+encodeURIComponent(id),{method:"DELETE"});if(r.ok){await load();renderAdmin();}}
load();