import{S as e,b as t,l as n,t as r,v as i}from"./storage.Bgrvw4re.js";function a(e){return`rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--color-`+e).trim()})`}function o(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var s=null,c=[],l=void 0,u=null,d=``,f=``;function p(){let e=new Set;return n().forEach(t=>(t.tags||[]).forEach(t=>e.add(t))),[...e]}function m(e){let t=new Date(e+`T00:00:00`),n=Math.floor((new Date().getTime()-t.getTime())/864e5);return n===0?`Hoy`:n===1?`Ayer`:n<7?`Hace ${n} días`:new Intl.DateTimeFormat(`es-MX`,{month:`short`,day:`numeric`}).format(t)}function h(){c=t(d,f);let e=document.getElementById(`notes-list`);if(!c.length){e.innerHTML=`
        <div class="p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
          <p class="text-sm text-muted">No hay notas.</p>
        </div>
      `;return}e.innerHTML=c.map(e=>{let t=(e.content||``).slice(0,70)+((e.content||``).length>70?`…`:``);return`
        <div class="note-item px-4 py-3 border-b border-[rgb(var(--edge)/0.05)] cursor-pointer transition-colors hover:bg-[rgb(var(--edge)/0.03)] ${e.id===s?`bg-[rgb(var(--edge)/0.05)]`:``}"
          data-id="${o(e.id)}">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-primary truncate">${o(e.title||`Sin título`)}</h3>
            <span class="text-[10px] text-muted2 flex-shrink-0 mt-0.5">${m(e.date)}</span>
          </div>
          ${t?`<p class="text-xs text-muted mt-0.5 line-clamp-2">${o(t)}</p>`:``}
          ${e.tags?.length?`<div class="flex flex-wrap gap-1 mt-1.5">${e.tags.map(e=>`<span class="text-[9px] px-1.5 py-0.5 bg-surface2 text-muted rounded-full">${o(e)}</span>`).join(``)}</div>`:``}
        </div>
      `}).join(``),e.querySelectorAll(`.note-item`).forEach(e=>{e.addEventListener(`click`,()=>v(e.dataset.id))})}function g(){let e=p(),t=document.getElementById(`tag-filters`);t.innerHTML=e.map(e=>`
      <button class="tag-filter text-[10px] px-2 py-0.5 rounded-full border transition-colors ${f===e?`bg-yellow/20 border-yellow/40 text-yellow`:`border-[rgb(var(--edge)/0.1)] text-muted hover:border-[rgb(var(--edge)/0.2)]`}"
        data-tag="${o(e)}">${o(e)}</button>
    `).join(``),t.querySelectorAll(`.tag-filter`).forEach(e=>{e.addEventListener(`click`,()=>{f=f===e.dataset.tag?``:e.dataset.tag||``,g(),h()})})}function _(e){return`
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
        <input id="note-title" type="text" value="${o(e.title||``)}"
          placeholder="Título de la nota"
          class="w-full bg-transparent text-xl font-semibold text-primary placeholder-muted2 focus:outline-none border-none"
        />
        <p class="text-xs text-muted2">${new Intl.DateTimeFormat(`es-MX`,{dateStyle:`medium`}).format(new Date(e.date+`T00:00:00`))}</p>
        <textarea id="note-content"
          placeholder="Escribe tu nota aquí..."
          class="flex-1 w-full bg-transparent text-sm text-primary placeholder-muted2 focus:outline-none resize-none font-mono min-h-[200px]"
        >${o(e.content||``)}</textarea>
        <div>
          <label class="text-xs text-muted uppercase tracking-wider block mb-2">Tags</label>
          <div class="flex flex-wrap gap-1.5 mb-2" id="tag-chips">
            ${(e.tags||[]).map(e=>`
              <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${o(e)}">
                ${o(e)}
                <button class="remove-tag hover:text-primary transition-colors" data-tag="${o(e)}">×</button>
              </span>
            `).join(``)}
          </div>
          <input id="tag-input" type="text" placeholder="Añadir tag + Enter"
            class="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgb(var(--edge)/0.2)] transition-colors"
          />
        </div>
      </div>
    `}function v(e){let t=n().find(t=>t.id===e);if(!t)return;s=e;let r=window.innerWidth<1024,i=r?document.getElementById(`mobile-editor-content`):document.getElementById(`editor-content`),a=document.getElementById(`mobile-editor`);r&&(a.classList.remove(`hidden`),a.classList.add(`flex`),document.getElementById(`notes-list-panel`).classList.add(`hidden`)),i.innerHTML=_(t),h(),y(t)}function y(e){window.innerWidth,document.querySelector(`.back-btn`)?.addEventListener(`click`,()=>{document.getElementById(`mobile-editor`).classList.add(`hidden`),document.getElementById(`mobile-editor`).classList.remove(`flex`),document.getElementById(`notes-list-panel`).classList.remove(`hidden`),s=null});let t=()=>{let e=document.getElementById(`autosave-status`),t=document.getElementById(`autosave-dot`),n=document.getElementById(`autosave-text`);e&&t&&n&&(t.classList.add(`animate-pulse`),t.style.background=a(`muted2`),n.textContent=`Guardando...`,e.style.opacity=`1`),clearTimeout(l),l=setTimeout(()=>{x(),e&&t&&n&&(t.classList.remove(`animate-pulse`),t.style.background=`#4ade80`,n.textContent=`Guardado`,setTimeout(()=>{e.style.opacity=`0`},2e3))},500)};document.getElementById(`note-title`)?.addEventListener(`input`,t),document.getElementById(`note-content`)?.addEventListener(`input`,t),document.getElementById(`tag-input`)?.addEventListener(`keydown`,e=>{if(e.key===`Enter`){e.preventDefault();let t=e.target.value.trim();if(!t)return;let r=n().find(e=>e.id===s);if(!r)return;let a=[...r.tags||[]];a.includes(t)||(a.push(t),i({...r,tags:a})),e.target.value=``;let c=n().find(e=>e.id===s);if(c){let e=document.getElementById(`tag-chips`);e.innerHTML=c.tags.map(e=>`
            <span class="tag-chip flex items-center gap-1 text-xs px-2.5 py-1 bg-surface2 text-muted rounded-full" data-tag="${o(e)}">
              ${o(e)}
              <button class="remove-tag hover:text-primary transition-colors" data-tag="${o(e)}">×</button>
            </span>
          `).join(``),b()}g(),h()}}),b(),document.getElementById(`delete-note-btn`)?.addEventListener(`click`,()=>{u=s,document.getElementById(`delete-modal`).classList.remove(`hidden`),document.getElementById(`delete-modal`).classList.add(`flex`)})}function b(){document.querySelectorAll(`.remove-tag`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.tag||``,r=n().find(e=>e.id===s);r&&(i({...r,tags:(r.tags||[]).filter(e=>e!==t)}),e.closest(`.tag-chip`).remove(),g(),h())})})}function x(){let e=n().find(e=>e.id===s);if(!e)return;let t=document.getElementById(`note-title`)?.value||``,r=document.getElementById(`note-content`)?.value||``;i({...e,title:t,content:r}),h()}function S(){let t={id:``,date:e(),title:``,content:``,tags:[]};i(t);let r=n()[0];v(r.id),g()}document.addEventListener(`astro:page-load`,()=>{g(),h(),document.getElementById(`new-note-btn`).addEventListener(`click`,S),document.getElementById(`search-input`).addEventListener(`input`,e=>{d=e.target.value,h()}),document.getElementById(`confirm-delete`).addEventListener(`click`,()=>{if(u){if(r(u),u===s){s=null,document.getElementById(`editor-content`).innerHTML=`
            <div class="text-center">
              <p class="text-sm text-muted">Selecciona una nota o crea una nueva</p>
            </div>
          `;let e=document.getElementById(`mobile-editor`);e.classList.add(`hidden`),e.classList.remove(`flex`),document.getElementById(`notes-list-panel`).classList.remove(`hidden`)}u=null,g(),h(),window.showToast&&window.showToast(`Nota eliminada`)}document.getElementById(`delete-modal`).classList.add(`hidden`),document.getElementById(`delete-modal`).classList.remove(`flex`)}),document.getElementById(`cancel-delete`).addEventListener(`click`,()=>{u=null,document.getElementById(`delete-modal`).classList.add(`hidden`),document.getElementById(`delete-modal`).classList.remove(`flex`)})});