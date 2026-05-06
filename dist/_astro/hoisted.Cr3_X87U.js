import{p as E,q as g,i,r as w}from"./ViewTransitions.astro_astro_type_script_index_0_lang.DxLj3x3s.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";let a=null,f=[],v,l=null,b="",u="";function L(){const t=new Set;return i().forEach(e=>(e.tags||[]).forEach(n=>t.add(n))),[...t]}function I(t){const e=new Date(t+"T00:00:00"),o=Math.floor((new Date().getTime()-e.getTime())/(1e3*60*60*24));return o===0?"Hoy":o===1?"Ayer":o<7?`Hace ${o} días`:new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(e)}function s(){f=E(b,u);const t=document.getElementById("notes-list");if(!f.length){t.innerHTML=`
        <div class="p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
          <p class="text-sm text-muted">No hay notas.</p>
        </div>
      `;return}t.innerHTML=f.map(e=>{const n=(e.content||"").slice(0,70)+((e.content||"").length>70?"…":"");return`
        <div class="note-item px-4 py-3 border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)] ${e.id===a?"bg-[rgba(255,255,255,0.05)]":""}"
          data-id="${e.id}">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-primary truncate">${e.title||"Sin título"}</h3>
            <span class="text-[10px] text-muted2 flex-shrink-0 mt-0.5">${I(e.date)}</span>
          </div>
          ${n?`<p class="text-xs text-muted mt-0.5 line-clamp-2">${n}</p>`:""}
          ${e.tags?.length?`<div class="flex flex-wrap gap-1 mt-1.5">${e.tags.map(d=>`<span class="text-[9px] px-1.5 py-0.5 bg-surface2 text-muted rounded-full">${d}</span>`).join("")}</div>`:""}
        </div>
      `}).join(""),t.querySelectorAll(".note-item").forEach(e=>{e.addEventListener("click",()=>h(e.dataset.id))})}function r(){const t=L(),e=document.getElementById("tag-filters");e.innerHTML=t.map(n=>`
      <button class="tag-filter text-[10px] px-2 py-0.5 rounded-full border transition-colors ${u===n?"bg-yellow/20 border-yellow/40 text-yellow":"border-[rgba(255,255,255,0.1)] text-muted hover:border-[rgba(255,255,255,0.2)]"}"
        data-tag="${n}">${n}</button>
    `).join(""),e.querySelectorAll(".tag-filter").forEach(n=>{n.addEventListener("click",()=>{u=u===n.dataset.tag?"":n.dataset.tag||"",r(),s()})})}function B(t){return`
      <div class="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[rgba(255,255,255,0.07)]">
        <button class="back-btn lg:hidden text-muted hover:text-primary transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="flex items-center gap-3 ml-auto">
          <span id="autosave-indicator" class="text-[10px] text-muted2 hidden">● Guardando...</span>
          <span id="saved-indicator" class="text-[10px] text-muted2"></span>
          <button id="delete-note-btn" class="text-muted hover:text-orange transition-colors">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-4 lg:px-8 py-4 flex flex-col gap-4">
        <input id="note-title" type="text" value="${(t.title||"").replace(/"/g,"&quot;")}"
          placeholder="Título de la nota"
          class="w-full bg-transparent text-xl font-semibold text-primary placeholder-muted2 focus:outline-none border-none"
        />
        <p class="text-xs text-muted2">${new Intl.DateTimeFormat("es-MX",{dateStyle:"medium"}).format(new Date(t.date+"T00:00:00"))}</p>
        <textarea id="note-content"
          placeholder="Escribe tu nota aquí..."
          class="flex-1 w-full bg-transparent text-sm text-primary placeholder-muted2 focus:outline-none resize-none font-mono min-h-[200px]"
        >${t.content||""}</textarea>
        <div>
          <label class="text-xs text-muted uppercase tracking-wider block mb-2">Tags</label>
          <div class="flex flex-wrap gap-1.5 mb-2" id="tag-chips">
            ${(t.tags||[]).map(e=>`
              <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${e}">
                ${e}
                <button class="remove-tag hover:text-primary transition-colors" data-tag="${e}">×</button>
              </span>
            `).join("")}
          </div>
          <input id="tag-input" type="text" placeholder="Añadir tag + Enter"
            class="w-full bg-[#1e2230] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
          />
        </div>
      </div>
    `}function h(t){const e=i().find(c=>c.id===t);if(!e)return;a=t;const n=window.innerWidth<1024,o=n?document.getElementById("mobile-editor-content"):document.getElementById("editor-content"),d=document.getElementById("mobile-editor");n&&(d.classList.remove("hidden"),d.classList.add("flex"),document.getElementById("notes-list-panel").classList.add("hidden")),o.innerHTML=B(e),s(),T()}function T(t){document.querySelector(".back-btn")?.addEventListener("click",()=>{document.getElementById("mobile-editor").classList.add("hidden"),document.getElementById("mobile-editor").classList.remove("flex"),document.getElementById("notes-list-panel").classList.remove("hidden"),a=null});const e=()=>{document.getElementById("autosave-indicator")?.classList.remove("hidden"),clearTimeout(v),v=setTimeout(()=>{$(),document.getElementById("autosave-indicator")?.classList.add("hidden");const n=document.getElementById("saved-indicator");n&&(n.textContent="Guardado"),setTimeout(()=>{n&&(n.textContent="")},3e3)},500)};document.getElementById("note-title")?.addEventListener("input",e),document.getElementById("note-content")?.addEventListener("input",e),document.getElementById("tag-input")?.addEventListener("keydown",n=>{if(n.key==="Enter"){n.preventDefault();const o=n.target.value.trim();if(!o)return;const d=i().find(m=>m.id===a);if(!d)return;const c=[...d.tags||[]];c.includes(o)||(c.push(o),g({...d,tags:c})),n.target.value="";const x=i().find(m=>m.id===a);if(x){const m=document.getElementById("tag-chips");m.innerHTML=x.tags.map(p=>`
            <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${p}">
              ${p}
              <button class="remove-tag hover:text-primary transition-colors" data-tag="${p}">×</button>
            </span>
          `).join(""),y()}r(),s()}}),y(),document.getElementById("delete-note-btn")?.addEventListener("click",()=>{l=a,document.getElementById("delete-modal").classList.remove("hidden"),document.getElementById("delete-modal").classList.add("flex")})}function y(){document.querySelectorAll(".remove-tag").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.tag||"",n=i().find(o=>o.id===a);n&&(g({...n,tags:(n.tags||[]).filter(o=>o!==e)}),t.closest(".tag-chip").remove(),r(),s())})})}function $(){const t=i().find(o=>o.id===a);if(!t)return;const e=document.getElementById("note-title")?.value||"",n=document.getElementById("note-content")?.value||"";g({...t,title:e,content:n}),s()}function k(){const t={id:"",date:new Date().toISOString().slice(0,10),title:"",content:"",tags:[]};g(t);const e=i()[0];h(e.id),r()}document.addEventListener("DOMContentLoaded",()=>{r(),s(),document.getElementById("new-note-btn").addEventListener("click",k),document.getElementById("search-input").addEventListener("input",t=>{b=t.target.value,s()}),document.getElementById("confirm-delete").addEventListener("click",()=>{if(l){if(w(l),l===a){a=null,document.getElementById("editor-content").innerHTML=`
            <div class="text-center">
              <p class="text-sm text-muted">Selecciona una nota o crea una nueva</p>
            </div>
          `;const t=document.getElementById("mobile-editor");t.classList.add("hidden"),t.classList.remove("flex"),document.getElementById("notes-list-panel").classList.remove("hidden")}l=null,r(),s(),window.showToast&&window.showToast("Nota eliminada")}document.getElementById("delete-modal").classList.add("hidden"),document.getElementById("delete-modal").classList.remove("flex")}),document.getElementById("cancel-delete").addEventListener("click",()=>{l=null,document.getElementById("delete-modal").classList.add("hidden"),document.getElementById("delete-modal").classList.remove("flex")})});
