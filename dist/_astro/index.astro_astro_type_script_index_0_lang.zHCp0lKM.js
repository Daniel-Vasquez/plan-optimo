import{S as e,d as t,f as n,o as r,s as i,y as a}from"./storage.Bgrvw4re.js";var o={1:{type:`fuerza`,label:`Fuerza`,exercises:[`Sentadilla goblet`,`P. muerto rumano`,`Zancadas`,`Hip thrust`,`Plancha frontal/lateral`]},2:{type:`mixto`,label:`Carrera + Fuerza`,morning:`Intervalos 400m × 6–8 a 4:45–5:00 min/km`,exercises:[`Press banca`,`Remo unilateral`,`Fondos`,`Curl bíceps`]},3:{type:`descanso`,label:`Descanso activo`,notes:`Movilidad, caminata opcional`},4:{type:`fuerza`,label:`Fuerza`,exercises:[`Sentadilla sumo`,`Ext. cadera`,`Step-up`,`Abdominal bicicleta`]},5:{type:`mixto`,label:`Carrera + Fuerza`,morning:`Tempo/Fartlek 3–4 km a 5:20–5:35 min/km`,exercises:[`Press militar`,`Elev. laterales`,`Remo mentón`,`Ext. tríceps`]},6:{type:`voleibol`,label:`Voleibol`,notes:`8am–12pm`},0:{type:`cardio`,label:`Carrera larga`,running:`Carrera larga 10–15 km a 6:30–6:50 min/km`}},s={fuerza:`#e8ff47`,cardio:`#47c2ff`,mixto:`#ff6b35`,descanso:`#8890a8`,voleibol:`#47c2ff`},c={fuerza:`rgba(232,255,71,0.1)`,cardio:`rgba(71,194,255,0.1)`,mixto:`rgba(255,107,53,0.1)`,descanso:`rgba(136,144,168,0.07)`,voleibol:`rgba(71,194,255,0.1)`},l={fuerza:`rgba(232,255,71,0.3)`,cardio:`rgba(71,194,255,0.3)`,mixto:`rgba(255,107,53,0.3)`,descanso:`rgba(136,144,168,0.2)`,voleibol:`rgba(71,194,255,0.3)`},u=void 0,d={};function f(){let t=new URLSearchParams(window.location.search).get(`date`);if(t&&/^\d{4}-\d{2}-\d{2}$/.test(t))return t;let n=window.location.pathname.match(/(\d{4}-\d{2}-\d{2})/);return n?n[1]:e()}function p(e){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()}function m(e){return`rgb(${p(`--color-`+e)})`}function h(e){return`rgb(${p(`--edge`)} / ${e})`}function g(e,t=500){clearTimeout(u),u=setTimeout(e,t)}function _(e){a(e,d)}function v(e){let t=e.split(`:`);if(t.length!==2)return null;let n=parseInt(t[0]),r=parseInt(t[1]);return isNaN(n)||isNaN(r)?null:n*60+r}function y(){let e=f(),a=n(e),u=t(e)||{},p=i();r(),d={completed:u.completed||!1,type:u.type||a.type,week:u.week||p,water:u.water??0,note:u.note||``,running:u.running||{distance:``,pace:``}};let y=new Date(e+`T00:00:00`),x=new Intl.DateTimeFormat(`es-MX`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`}).format(y),S=d.type,C=s[S]||m(`muted`),w=c[S]||`transparent`,T=l[S]||h(.13),E=m(`ink`),D=m(`muted`),O=m(`primary`),k=h(.08),A=o[y.getDay()],j=S===`cardio`||S===`mixto`,M=``;A&&(A.exercises&&(M+=`<ul class="space-y-1">${A.exercises.map(e=>`<li class="flex items-center gap-2 text-sm text-muted"><span class="w-1 h-1 rounded-full bg-muted2 flex-shrink-0 mt-1.5"></span>${e}</li>`).join(``)}</ul>`),A.morning&&(M+=`<div class="text-sm text-muted mt-2"><span class="text-muted2 text-xs uppercase tracking-wider">Carrera AM · </span>${A.morning}</div>`),A.running&&(M+=`<div class="text-sm text-muted">${A.running}</div>`),A.notes&&(M+=`<div class="text-sm text-muted">${A.notes}</div>`)),document.getElementById(`day-content`).innerHTML=`
      <div class="space-y-5">
        <div>
          <a href="/" class="text-xs text-muted hover:text-primary flex items-center gap-1 mb-3 transition-colors">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </a>
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p class="text-xs text-muted capitalize mb-1">${x}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-display text-2xl" style="color:${C}">${(A?.label||a.label||``).toUpperCase()}</span>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background:${w};color:${C};border:1px solid ${T}">
                  ${S.charAt(0).toUpperCase()+S.slice(1)}
                </span>
              </div>
            </div>
            <span class="text-xs bg-surface2 text-muted px-2 py-1 rounded-full self-start">Sem ${p}</span>
          </div>
        </div>

        <div class="rounded-xl border p-1 flex" style="border-color:${T}; background:${w}">
          <button id="btn-completed" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${d.completed?`background:${C};color:${E}`:`color:${D}`}">
            COMPLETADA
          </button>
          <button id="btn-pending" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${d.completed?`color:${D}`:`background:${k};color:${O}`}">
            PENDIENTE
          </button>
        </div>

        <div class="bg-surface border border-border rounded-xl p-4 space-y-5">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-muted uppercase tracking-wider">Agua</label>
              <span id="water-value" class="text-sm font-bold text-primary">${Number(d.water).toFixed(1)} L</span>
            </div>
            <input type="range" id="water-slider" min="0" max="4" step="0.25" value="${d.water}"
              class="w-full h-1.5 rounded-full cursor-pointer"
              style="accent-color: #47c2ff"
            />
            <div class="flex justify-between text-[10px] text-muted2 mt-1">
              <span>0 L</span><span>2 L</span><span>4 L</span>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-muted uppercase tracking-wider">Nota del día</label>
              <span id="note-chars" class="text-[10px] text-muted2">${(d.note||``).length}/500</span>
            </div>
            <textarea id="note-input" maxlength="500"
              placeholder="¿Cómo te sentiste? ¿Algo a destacar?..."
              class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgb(var(--edge)/0.2)] resize-none transition-colors"
              rows="3"
            >${d.note||``}</textarea>
          </div>
        </div>

        ${j?`
        <div class="bg-surface border border-blue/20 rounded-xl p-4 space-y-4">
          <h3 class="text-xs text-muted uppercase tracking-wider flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Carrera
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-muted mb-1.5">Distancia (km)</label>
              <input type="number" id="run-distance" value="${d.running.distance||``}" min="0" max="100" step="0.1"
                class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-blue/50 transition-colors"
                placeholder="0.0"
              />
            </div>
            <div>
              <label class="block text-xs text-muted mb-1.5">Ritmo (MM:SS /km)</label>
              <input type="text" id="run-pace" value="${d.running.pace||``}"
                class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-blue/50 transition-colors"
                placeholder="05:55" maxlength="5"
              />
              <p id="pace-error" class="text-[10px] text-orange mt-1 hidden">Ritmo debe estar entre 3:00 y 12:00</p>
            </div>
          </div>
        </div>
        `:``}

        <div class="bg-surface border border-border rounded-xl overflow-hidden">
          <button id="plan-toggle" class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgb(var(--edge)/0.03)] transition-colors">
            <span class="text-xs text-muted uppercase tracking-wider">Plan de hoy</span>
            <svg id="plan-chevron" class="w-4 h-4 text-muted2 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="plan-body" class="hidden px-4 pb-4 space-y-2">
            ${M||`<p class="text-sm text-muted">No hay plan registrado para este día.</p>`}
          </div>
        </div>
      </div>

      <div class="fixed bottom-20 left-0 right-0 px-4 lg:hidden z-30">
        <button id="save-btn" class="w-full py-4 rounded-xl font-bold text-base shadow-xl transition-all active:scale-95" style="background:${C};color:${E}">
          Guardar sesión
        </button>
      </div>

      <div class="hidden lg:block mt-6">
        <button id="save-btn-desktop" class="px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 hover:opacity-90" style="background:${C};color:${E}">
          Guardar sesión
        </button>
      </div>
    `,document.getElementById(`btn-completed`).addEventListener(`click`,()=>{d.completed=!0,b(C),g(()=>_(e))}),document.getElementById(`btn-pending`).addEventListener(`click`,()=>{d.completed=!1,b(C),g(()=>_(e))}),document.getElementById(`water-slider`).addEventListener(`input`,t=>{d.water=parseFloat(t.target.value),document.getElementById(`water-value`).textContent=d.water.toFixed(1)+` L`,g(()=>_(e))}),document.getElementById(`note-input`).addEventListener(`input`,t=>{d.note=t.target.value,document.getElementById(`note-chars`).textContent=`${d.note.length}/500`,g(()=>_(e))}),j&&(document.getElementById(`run-distance`).addEventListener(`input`,t=>{d.running.distance=parseFloat(t.target.value)||0,g(()=>_(e))}),document.getElementById(`run-pace`).addEventListener(`input`,t=>{let n=t.target.value.replace(/[^0-9:]/g,``).replace(/:/g,``),r=n;n.length>2&&(r=n.slice(0,n.length-2)+`:`+n.slice(-2)),r!==t.target.value&&(t.target.value=r);let i=v(r),a=document.getElementById(`pace-error`);r.includes(`:`)&&i!==null&&(i<180||i>720)?a.classList.remove(`hidden`):a.classList.add(`hidden`),d.running.pace=r,g(()=>_(e))})),document.getElementById(`plan-toggle`).addEventListener(`click`,()=>{let e=document.getElementById(`plan-body`),t=document.getElementById(`plan-chevron`);e.classList.toggle(`hidden`),t.style.transform=e.classList.contains(`hidden`)?`rotate(0deg)`:`rotate(180deg)`});let N=()=>{_(e),window.showToast&&window.showToast(`Sesión guardada correctamente`),setTimeout(()=>{window.location.href=`/`},1200)};document.getElementById(`save-btn`)?.addEventListener(`click`,N),document.getElementById(`save-btn-desktop`)?.addEventListener(`click`,N)}function b(e){let t=document.getElementById(`btn-completed`),n=document.getElementById(`btn-pending`);d.completed?(t.style.background=e,t.style.color=m(`ink`),n.style.background=`transparent`,n.style.color=m(`muted`)):(t.style.background=`transparent`,t.style.color=m(`muted`),n.style.background=h(.08),n.style.color=m(`primary`))}document.addEventListener(`astro:page-load`,y);