import{b as D,f as z,h as P,a as N,i as A}from"./ViewTransitions.astro_astro_type_script_index_0_lang.BnoDHjx8.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";const j={1:{type:"fuerza",label:"Fuerza",exercises:["Sentadilla goblet","P. muerto rumano","Zancadas","Hip thrust","Plancha frontal/lateral"]},2:{type:"mixto",label:"Carrera + Fuerza",morning:"Intervalos 400m × 6–8 a 4:45–5:00 min/km",exercises:["Press banca","Remo unilateral","Fondos","Curl bíceps"]},3:{type:"descanso",label:"Descanso activo",notes:"Movilidad, caminata opcional"},4:{type:"fuerza",label:"Fuerza",exercises:["Sentadilla sumo","Ext. cadera","Step-up","Abdominal bicicleta"]},5:{type:"mixto",label:"Carrera + Fuerza",morning:"Tempo/Fartlek 3–4 km a 5:20–5:35 min/km",exercises:["Press militar","Elev. laterales","Remo mentón","Ext. tríceps"]},6:{type:"voleibol",label:"Voleibol",notes:"8am–12pm"},0:{type:"cardio",label:"Carrera larga",running:"Carrera larga 10–15 km a 6:30–6:50 min/km"}},M={fuerza:"#e8ff47",cardio:"#47c2ff",mixto:"#ff6b35",descanso:"#8890a8",voleibol:"#47c2ff"},R={fuerza:"rgba(232,255,71,0.1)",cardio:"rgba(71,194,255,0.1)",mixto:"rgba(255,107,53,0.1)",descanso:"rgba(136,144,168,0.07)",voleibol:"rgba(71,194,255,0.1)"},H={fuerza:"rgba(232,255,71,0.3)",cardio:"rgba(71,194,255,0.3)",mixto:"rgba(255,107,53,0.3)",descanso:"rgba(136,144,168,0.2)",voleibol:"rgba(71,194,255,0.3)"};let I,t={};function O(){const n=new URLSearchParams(window.location.search).get("date");if(n&&/^\d{4}-\d{2}-\d{2}$/.test(n))return n;const a=window.location.pathname.match(/(\d{4}-\d{2}-\d{2})/);if(a)return a[1];const o=new Date;return o.setHours(0,0,0,0),o.toISOString().slice(0,10)}function B(e){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()}function l(e){return`rgb(${B("--color-"+e)})`}function f(e){return`rgb(${B("--edge")} / ${e})`}function p(e,n=500){clearTimeout(I),I=setTimeout(e,n)}function c(e){A(e,t)}function U(e){const n=e.split(":");if(n.length!==2)return null;const a=parseInt(n[0]),o=parseInt(n[1]);return isNaN(a)||isNaN(o)?null:a*60+o}function G(){const e=O(),n=D(e),a=z(e)||{},o=P();N(),t={completed:a.completed||!1,type:a.type||n.type,week:a.week||o,water:a.water??0,note:a.note||"",running:a.running||{distance:"",pace:""}};const v=new Date(e+"T00:00:00"),S=new Intl.DateTimeFormat("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(v),d=t.type,i=M[d]||l("muted"),y=R[d]||"transparent",w=H[d]||f(.13),b=l("ink"),h=l("muted"),F=l("primary"),T=f(.08),r=j[v.getDay()],k=d==="cardio"||d==="mixto";let m="";r&&(r.exercises&&(m+=`<ul class="space-y-1">${r.exercises.map(s=>`<li class="flex items-center gap-2 text-sm text-muted"><span class="w-1 h-1 rounded-full bg-muted2 flex-shrink-0 mt-1.5"></span>${s}</li>`).join("")}</ul>`),r.morning&&(m+=`<div class="text-sm text-muted mt-2"><span class="text-muted2 text-xs uppercase tracking-wider">Carrera AM · </span>${r.morning}</div>`),r.running&&(m+=`<div class="text-sm text-muted">${r.running}</div>`),r.notes&&(m+=`<div class="text-sm text-muted">${r.notes}</div>`)),document.getElementById("day-content").innerHTML=`
      <div class="space-y-5">
        <div>
          <a href="/" class="text-xs text-muted hover:text-primary flex items-center gap-1 mb-3 transition-colors">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </a>
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p class="text-xs text-muted capitalize mb-1">${S}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-display text-2xl" style="color:${i}">${(r?.label||n.label||"").toUpperCase()}</span>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background:${y};color:${i};border:1px solid ${w}">
                  ${d.charAt(0).toUpperCase()+d.slice(1)}
                </span>
              </div>
            </div>
            <span class="text-xs bg-surface2 text-muted px-2 py-1 rounded-full self-start">Sem ${o}</span>
          </div>
        </div>

        <div class="rounded-xl border p-1 flex" style="border-color:${w}; background:${y}">
          <button id="btn-completed" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${t.completed?`background:${i};color:${b}`:`color:${h}`}">
            COMPLETADA
          </button>
          <button id="btn-pending" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${t.completed?`color:${h}`:`background:${T};color:${F}`}">
            PENDIENTE
          </button>
        </div>

        <div class="bg-surface border border-border rounded-xl p-4 space-y-5">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-muted uppercase tracking-wider">Agua</label>
              <span id="water-value" class="text-sm font-bold text-primary">${Number(t.water).toFixed(1)} L</span>
            </div>
            <input type="range" id="water-slider" min="0" max="4" step="0.25" value="${t.water}"
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
              <span id="note-chars" class="text-[10px] text-muted2">${(t.note||"").length}/500</span>
            </div>
            <textarea id="note-input" maxlength="500"
              placeholder="¿Cómo te sentiste? ¿Algo a destacar?..."
              class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgb(var(--edge)/0.2)] resize-none transition-colors"
              rows="3"
            >${t.note||""}</textarea>
          </div>
        </div>

        ${k?`
        <div class="bg-surface border border-blue/20 rounded-xl p-4 space-y-4">
          <h3 class="text-xs text-muted uppercase tracking-wider flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Carrera
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-muted mb-1.5">Distancia (km)</label>
              <input type="number" id="run-distance" value="${t.running.distance||""}" min="0" max="100" step="0.1"
                class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-blue/50 transition-colors"
                placeholder="0.0"
              />
            </div>
            <div>
              <label class="block text-xs text-muted mb-1.5">Ritmo (MM:SS /km)</label>
              <input type="text" id="run-pace" value="${t.running.pace||""}"
                class="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-blue/50 transition-colors"
                placeholder="05:55" maxlength="5"
              />
              <p id="pace-error" class="text-[10px] text-orange mt-1 hidden">Ritmo debe estar entre 3:00 y 12:00</p>
            </div>
          </div>
        </div>
        `:""}

        <div class="bg-surface border border-border rounded-xl overflow-hidden">
          <button id="plan-toggle" class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgb(var(--edge)/0.03)] transition-colors">
            <span class="text-xs text-muted uppercase tracking-wider">Plan de hoy</span>
            <svg id="plan-chevron" class="w-4 h-4 text-muted2 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="plan-body" class="hidden px-4 pb-4 space-y-2">
            ${m||'<p class="text-sm text-muted">No hay plan registrado para este día.</p>'}
          </div>
        </div>
      </div>

      <div class="fixed bottom-20 left-0 right-0 px-4 lg:hidden z-30">
        <button id="save-btn" class="w-full py-4 rounded-xl font-bold text-base shadow-xl transition-all active:scale-95" style="background:${i};color:${b}">
          Guardar sesión
        </button>
      </div>

      <div class="hidden lg:block mt-6">
        <button id="save-btn-desktop" class="px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 hover:opacity-90" style="background:${i};color:${b}">
          Guardar sesión
        </button>
      </div>
    `,document.getElementById("btn-completed").addEventListener("click",()=>{t.completed=!0,L(i),p(()=>c(e))}),document.getElementById("btn-pending").addEventListener("click",()=>{t.completed=!1,L(i),p(()=>c(e))}),document.getElementById("water-slider").addEventListener("input",s=>{t.water=parseFloat(s.target.value),document.getElementById("water-value").textContent=t.water.toFixed(1)+" L",p(()=>c(e))}),document.getElementById("note-input").addEventListener("input",s=>{t.note=s.target.value,document.getElementById("note-chars").textContent=`${t.note.length}/500`,p(()=>c(e))}),k&&(document.getElementById("run-distance").addEventListener("input",s=>{t.running.distance=parseFloat(s.target.value)||0,p(()=>c(e))}),document.getElementById("run-pace").addEventListener("input",s=>{const g=s.target.value.replace(/[^0-9:]/g,"").replace(/:/g,"");let u=g;g.length>2&&(u=g.slice(0,g.length-2)+":"+g.slice(-2)),u!==s.target.value&&(s.target.value=u);const x=U(u),C=document.getElementById("pace-error");u.includes(":")&&x!==null&&(x<180||x>720)?C.classList.remove("hidden"):C.classList.add("hidden"),t.running.pace=u,p(()=>c(e))})),document.getElementById("plan-toggle").addEventListener("click",()=>{const s=document.getElementById("plan-body"),E=document.getElementById("plan-chevron");s.classList.toggle("hidden"),E.style.transform=s.classList.contains("hidden")?"rotate(0deg)":"rotate(180deg)"});const $=()=>{c(e),window.showToast&&window.showToast("Sesión guardada correctamente"),setTimeout(()=>{window.location.href="/"},1200)};document.getElementById("save-btn")?.addEventListener("click",$),document.getElementById("save-btn-desktop")?.addEventListener("click",$)}function L(e){const n=document.getElementById("btn-completed"),a=document.getElementById("btn-pending");t.completed?(n.style.background=e,n.style.color=l("ink"),a.style.background="transparent",a.style.color=l("muted")):(n.style.background="transparent",n.style.color=l("muted"),a.style.background=f(.08),a.style.color=l("primary"))}document.addEventListener("astro:page-load",G);
