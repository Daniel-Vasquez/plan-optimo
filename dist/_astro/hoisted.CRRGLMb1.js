import{s as w,c as p,d as r,e as L}from"./ViewTransitions.astro_astro_type_script_index_0_lang.BnoDHjx8.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";function I(e){return`rgb(${getComputedStyle(document.documentElement).getPropertyValue("--color-"+e).trim()})`}function a(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}let s=null,v=[],y,i=null,h="",g="";function B(){const e=new Set;return r().forEach(t=>(t.tags||[]).forEach(n=>e.add(n))),[...e]}function T(e){const t=new Date(e+"T00:00:00"),o=Math.floor((new Date().getTime()-t.getTime())/(1e3*60*60*24));return o===0?"Hoy":o===1?"Ayer":o<7?`Hace ${o} días`:new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(t)}function l(){v=w(h,g);const e=document.getElementById("notes-list");if(!v.length){e.innerHTML=`
        <div class="p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
          <p class="text-sm text-muted">No hay notas.</p>
        </div>
      `;return}e.innerHTML=v.map(t=>{const n=(t.content||"").slice(0,70)+((t.content||"").length>70?"…":"");return`
        <div class="note-item px-4 py-3 border-b border-[rgb(var(--edge)/0.05)] cursor-pointer transition-colors hover:bg-[rgb(var(--edge)/0.03)] ${t.id===s?"bg-[rgb(var(--edge)/0.05)]":""}"
          data-id="${a(t.id)}">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-primary truncate">${a(t.title||"Sin título")}</h3>
            <span class="text-[10px] text-muted2 flex-shrink-0 mt-0.5">${T(t.date)}</span>
          </div>
          ${n?`<p class="text-xs text-muted mt-0.5 line-clamp-2">${a(n)}</p>`:""}
          ${t.tags?.length?`<div class="flex flex-wrap gap-1 mt-1.5">${t.tags.map(d=>`<span class="text-[9px] px-1.5 py-0.5 bg-surface2 text-muted rounded-full">${a(d)}</span>`).join("")}</div>`:""}
        </div>
      `}).join(""),e.querySelectorAll(".note-item").forEach(t=>{t.addEventListener("click",()=>E(t.dataset.id))})}function c(){const e=B(),t=document.getElementById("tag-filters");t.innerHTML=e.map(n=>`
      <button class="tag-filter text-[10px] px-2 py-0.5 rounded-full border transition-colors ${g===n?"bg-yellow/20 border-yellow/40 text-yellow":"border-[rgb(var(--edge)/0.1)] text-muted hover:border-[rgb(var(--edge)/0.2)]"}"
        data-tag="${a(n)}">${a(n)}</button>
    `).join(""),t.querySelectorAll(".tag-filter").forEach(n=>{n.addEventListener("click",()=>{g=g===n.dataset.tag?"":n.dataset.tag||"",c(),l()})})}function $(e){return`
      <div class="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
        <button class="back-btn lg:hidden text-muted hover:text-primary transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="flex items-center gap-3 ml-auto">
          <button id="delete-note-btn" class="text-muted hover:text-orange transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-4 lg:px-8 py-4 flex flex-col gap-4">
        <input id="note-title" type="text" value="${a(e.title||"")}"
          placeholder="Título de la nota"
          class="w-full bg-transparent text-xl font-semibold text-primary placeholder-muted2 focus:outline-none border-none"
        />
        <p class="text-xs text-muted2">${new Intl.DateTimeFormat("es-MX",{dateStyle:"medium"}).format(new Date(e.date+"T00:00:00"))}</p>
        <textarea id="note-content"
          placeholder="Escribe tu nota aquí..."
          class="flex-1 w-full bg-transparent text-sm text-primary placeholder-muted2 focus:outline-none resize-none font-mono min-h-[200px]"
        >${a(e.content||"")}</textarea>
        <div>
          <label class="text-xs text-muted uppercase tracking-wider block mb-2">Tags</label>
          <div class="flex flex-wrap gap-1.5 mb-2" id="tag-chips">
            ${(e.tags||[]).map(t=>`
              <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${a(t)}">
                ${a(t)}
                <button class="remove-tag hover:text-primary transition-colors" data-tag="${a(t)}">×</button>
              </span>
            `).join("")}
          </div>
          <input id="tag-input" type="text" placeholder="Añadir tag + Enter"
            class="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgb(var(--edge)/0.2)] transition-colors"
          />
        </div>
      </div>
    `}function E(e){const t=r().find(m=>m.id===e);if(!t)return;s=e;const n=window.innerWidth<1024,o=n?document.getElementById("mobile-editor-content"):document.getElementById("editor-content"),d=document.getElementById("mobile-editor");n&&(d.classList.remove("hidden"),d.classList.add("flex"),document.getElementById("notes-list-panel").classList.add("hidden")),o.innerHTML=$(t),l(),k()}function k(e){document.querySelector(".back-btn")?.addEventListener("click",()=>{document.getElementById("mobile-editor").classList.add("hidden"),document.getElementById("mobile-editor").classList.remove("flex"),document.getElementById("notes-list-panel").classList.remove("hidden"),s=null});const t=()=>{const n=document.getElementById("autosave-status"),o=document.getElementById("autosave-dot"),d=document.getElementById("autosave-text");n&&o&&d&&(o.classList.add("animate-pulse"),o.style.background=I("muted2"),d.textContent="Guardando...",n.style.opacity="1"),clearTimeout(y),y=setTimeout(()=>{S(),n&&o&&d&&(o.classList.remove("animate-pulse"),o.style.background="#4ade80",d.textContent="Guardado",setTimeout(()=>{n.style.opacity="0"},2e3))},500)};document.getElementById("note-title")?.addEventListener("input",t),document.getElementById("note-content")?.addEventListener("input",t),document.getElementById("tag-input")?.addEventListener("keydown",n=>{if(n.key==="Enter"){n.preventDefault();const o=n.target.value.trim();if(!o)return;const d=r().find(u=>u.id===s);if(!d)return;const m=[...d.tags||[]];m.includes(o)||(m.push(o),p({...d,tags:m})),n.target.value="";const x=r().find(u=>u.id===s);if(x){const u=document.getElementById("tag-chips");u.innerHTML=x.tags.map(f=>`
            <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${a(f)}">
              ${a(f)}
              <button class="remove-tag hover:text-primary transition-colors" data-tag="${a(f)}">×</button>
            </span>
          `).join(""),b()}c(),l()}}),b(),document.getElementById("delete-note-btn")?.addEventListener("click",()=>{i=s,document.getElementById("delete-modal").classList.remove("hidden"),document.getElementById("delete-modal").classList.add("flex")})}function b(){document.querySelectorAll(".remove-tag").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.tag||"",n=r().find(o=>o.id===s);n&&(p({...n,tags:(n.tags||[]).filter(o=>o!==t)}),e.closest(".tag-chip").remove(),c(),l())})})}function S(){const e=r().find(o=>o.id===s);if(!e)return;const t=document.getElementById("note-title")?.value||"",n=document.getElementById("note-content")?.value||"";p({...e,title:t,content:n}),l()}function H(){const e={id:"",date:new Date().toISOString().slice(0,10),title:"",content:"",tags:[]};p(e);const t=r()[0];E(t.id),c()}document.addEventListener("astro:page-load",()=>{c(),l(),document.getElementById("new-note-btn").addEventListener("click",H),document.getElementById("search-input").addEventListener("input",e=>{h=e.target.value,l()}),document.getElementById("confirm-delete").addEventListener("click",()=>{if(i){if(L(i),i===s){s=null,document.getElementById("editor-content").innerHTML=`
            <div class="text-center">
              <p class="text-sm text-muted">Selecciona una nota o crea una nueva</p>
            </div>
          `;const e=document.getElementById("mobile-editor");e.classList.add("hidden"),e.classList.remove("flex"),document.getElementById("notes-list-panel").classList.remove("hidden")}i=null,c(),l(),window.showToast&&window.showToast("Nota eliminada")}document.getElementById("delete-modal").classList.add("hidden"),document.getElementById("delete-modal").classList.remove("flex")}),document.getElementById("cancel-delete").addEventListener("click",()=>{i=null,document.getElementById("delete-modal").classList.add("hidden"),document.getElementById("delete-modal").classList.remove("flex")})});
