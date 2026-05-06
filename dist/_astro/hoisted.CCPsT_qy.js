import{b as L,d as I,a as B,c as C,s as S}from"./ViewTransitions.astro_astro_type_script_index_0_lang.DxLj3x3s.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";const F={1:{type:"fuerza",label:"Fuerza",exercises:["Sentadilla goblet","P. muerto rumano","Zancadas","Hip thrust","Plancha frontal/lateral"]},2:{type:"mixto",label:"Carrera + Fuerza",morning:"Intervalos 400m × 6–8 a 4:45–5:00 min/km",exercises:["Press banca","Remo unilateral","Fondos","Curl bíceps"]},3:{type:"descanso",label:"Descanso activo",notes:"Movilidad, caminata opcional"},4:{type:"fuerza",label:"Fuerza",exercises:["Sentadilla sumo","Ext. cadera","Step-up","Abdominal bicicleta"]},5:{type:"mixto",label:"Carrera + Fuerza",morning:"Tempo/Fartlek 3–4 km a 5:20–5:35 min/km",exercises:["Press militar","Elev. laterales","Remo mentón","Ext. tríceps"]},6:{type:"voleibol",label:"Voleibol",notes:"8am–12pm"},0:{type:"cardio",label:"Carrera larga",running:"Carrera larga 10–15 km a 6:30–6:50 min/km"}},T={fuerza:"#e8ff47",cardio:"#47c2ff",mixto:"#ff6b35",descanso:"#8890a8",voleibol:"#47c2ff"},D={fuerza:"rgba(232,255,71,0.1)",cardio:"rgba(71,194,255,0.1)",mixto:"rgba(255,107,53,0.1)",descanso:"rgba(136,144,168,0.07)",voleibol:"rgba(71,194,255,0.1)"},z={fuerza:"rgba(232,255,71,0.3)",cardio:"rgba(71,194,255,0.3)",mixto:"rgba(255,107,53,0.3)",descanso:"rgba(136,144,168,0.2)",voleibol:"rgba(71,194,255,0.3)"};let k,e={};function N(){const a=new URLSearchParams(window.location.search).get("date");if(a&&/^\d{4}-\d{2}-\d{2}$/.test(a))return a;const n=window.location.pathname.match(/(\d{4}-\d{2}-\d{2})/);return n?n[1]:new Date().toISOString().slice(0,10)}function c(t,a=500){clearTimeout(k),k=setTimeout(t,a)}function d(t){S(t,e)}function P(t){const a=t.split(":");if(a.length!==2)return null;const n=parseInt(a[0]),p=parseInt(a[1]);return isNaN(n)||isNaN(p)?null:n*60+p}function A(){const t=N(),a=L(t),n=I(t)||{},p=B();C(),e={completed:n.completed||!1,type:n.type||a.type,week:n.week||p,water:n.water??0,note:n.note||"",running:n.running||{distance:"",pace:""}};const b=new Date(t+"T00:00:00"),$=new Intl.DateTimeFormat("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(b),o=e.type,l=T[o]||"#8890a8",x=D[o]||"transparent",f=z[o]||"rgba(255,255,255,0.13)",r=F[b.getDay()],v=o==="cardio"||o==="mixto";let u="";r&&(r.exercises&&(u+=`<ul class="space-y-1">${r.exercises.map(s=>`<li class="flex items-center gap-2 text-sm text-muted"><span class="w-1 h-1 rounded-full bg-muted2 flex-shrink-0 mt-1.5"></span>${s}</li>`).join("")}</ul>`),r.morning&&(u+=`<div class="text-sm text-muted mt-2"><span class="text-muted2 text-xs uppercase tracking-wider">Carrera AM · </span>${r.morning}</div>`),r.running&&(u+=`<div class="text-sm text-muted">${r.running}</div>`),r.notes&&(u+=`<div class="text-sm text-muted">${r.notes}</div>`)),document.getElementById("day-content").innerHTML=`
      <div class="space-y-5">
        <div>
          <a href="/" class="text-xs text-muted hover:text-primary flex items-center gap-1 mb-3 transition-colors">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </a>
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p class="text-xs text-muted capitalize mb-1">${$}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-display text-2xl" style="color:${l}">${(r?.label||a.label||"").toUpperCase()}</span>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background:${x};color:${l};border:1px solid ${f}">
                  ${o.charAt(0).toUpperCase()+o.slice(1)}
                </span>
              </div>
            </div>
            <span class="text-xs bg-surface2 text-muted px-2 py-1 rounded-full self-start">Sem ${p}</span>
          </div>
        </div>

        <div class="rounded-xl border p-1 flex" style="border-color:${f}; background:${x}">
          <button id="btn-completed" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${e.completed?`background:${l};color:#0d0f14`:"color:#8890a8"}">
            COMPLETADA
          </button>
          <button id="btn-pending" class="flex-1 py-3 rounded-lg text-sm font-bold transition-all" style="${e.completed?"color:#8890a8":"background:rgba(255,255,255,0.08);color:#f0f2f8"}">
            PENDIENTE
          </button>
        </div>

        <div class="bg-[#161920] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 space-y-5">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs text-muted uppercase tracking-wider">Agua</label>
              <span id="water-value" class="text-sm font-bold text-primary">${Number(e.water).toFixed(1)} L</span>
            </div>
            <input type="range" id="water-slider" min="0" max="4" step="0.25" value="${e.water}"
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
              <span id="note-chars" class="text-[10px] text-muted2">${(e.note||"").length}/500</span>
            </div>
            <textarea id="note-input" maxlength="500"
              placeholder="¿Cómo te sentiste? ¿Algo a destacar?..."
              class="w-full bg-[#1e2230] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2.5 text-sm text-primary placeholder-muted2 focus:outline-none focus:border-[rgba(255,255,255,0.2)] resize-none transition-colors"
              rows="3"
            >${e.note||""}</textarea>
          </div>
        </div>

        ${v?`
        <div class="bg-[#161920] border border-[rgba(71,194,255,0.2)] rounded-xl p-4 space-y-4">
          <h3 class="text-xs text-muted uppercase tracking-wider flex items-center gap-2">
            <svg class="w-3.5 h-3.5 text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Carrera
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-muted mb-1.5">Distancia (km)</label>
              <input type="number" id="run-distance" value="${e.running.distance||""}" min="0" max="100" step="0.1"
                class="w-full bg-[#1e2230] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-[rgba(71,194,255,0.5)] transition-colors"
                placeholder="0.0"
              />
            </div>
            <div>
              <label class="block text-xs text-muted mb-1.5">Ritmo (MM:SS /km)</label>
              <input type="text" id="run-pace" value="${e.running.pace||""}"
                class="w-full bg-[#1e2230] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-[rgba(71,194,255,0.5)] transition-colors"
                placeholder="05:55" maxlength="5"
              />
              <p id="pace-error" class="text-[10px] text-orange mt-1 hidden">Ritmo debe estar entre 3:00 y 12:00</p>
            </div>
          </div>
        </div>
        `:""}

        <div class="bg-[#161920] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
          <button id="plan-toggle" class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors">
            <span class="text-xs text-muted uppercase tracking-wider">Plan de hoy</span>
            <svg id="plan-chevron" class="w-4 h-4 text-muted2 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div id="plan-body" class="hidden px-4 pb-4 space-y-2">
            ${u||'<p class="text-sm text-muted">No hay plan registrado para este día.</p>'}
          </div>
        </div>
      </div>

      <div class="fixed bottom-20 left-0 right-0 px-4 lg:hidden z-30">
        <button id="save-btn" class="w-full py-4 rounded-xl font-bold text-base shadow-xl transition-all active:scale-95" style="background:${l};color:#0d0f14">
          Guardar sesión
        </button>
      </div>

      <div class="hidden lg:block mt-6">
        <button id="save-btn-desktop" class="px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 hover:opacity-90" style="background:${l};color:#0d0f14">
          Guardar sesión
        </button>
      </div>
    `,document.getElementById("btn-completed").addEventListener("click",()=>{e.completed=!0,E(l),c(()=>d(t))}),document.getElementById("btn-pending").addEventListener("click",()=>{e.completed=!1,E(l),c(()=>d(t))}),document.getElementById("water-slider").addEventListener("input",s=>{e.water=parseFloat(s.target.value),document.getElementById("water-value").textContent=e.water.toFixed(1)+" L",c(()=>d(t))}),document.getElementById("note-input").addEventListener("input",s=>{e.note=s.target.value,document.getElementById("note-chars").textContent=`${e.note.length}/500`,c(()=>d(t))}),v&&(document.getElementById("run-distance").addEventListener("input",s=>{e.running.distance=parseFloat(s.target.value)||0,c(()=>d(t))}),document.getElementById("run-pace").addEventListener("input",s=>{const m=s.target.value.replace(/[^0-9:]/g,"").replace(/:/g,"");let i=m;m.length>2&&(i=m.slice(0,m.length-2)+":"+m.slice(-2)),i!==s.target.value&&(s.target.value=i);const g=P(i),h=document.getElementById("pace-error");i.includes(":")&&g!==null&&(g<180||g>720)?h.classList.remove("hidden"):h.classList.add("hidden"),e.running.pace=i,c(()=>d(t))})),document.getElementById("plan-toggle").addEventListener("click",()=>{const s=document.getElementById("plan-body"),w=document.getElementById("plan-chevron");s.classList.toggle("hidden"),w.style.transform=s.classList.contains("hidden")?"rotate(0deg)":"rotate(180deg)"});const y=()=>{d(t),window.showToast&&window.showToast("Sesión guardada correctamente"),setTimeout(()=>{window.location.href="/"},1200)};document.getElementById("save-btn")?.addEventListener("click",y),document.getElementById("save-btn-desktop")?.addEventListener("click",y)}function E(t){const a=document.getElementById("btn-completed"),n=document.getElementById("btn-pending");e.completed?(a.style.background=t,a.style.color="#0d0f14",n.style.background="transparent",n.style.color="#8890a8"):(a.style.background="transparent",a.style.color="#8890a8",n.style.background="rgba(255,255,255,0.08)",n.style.color="#f0f2f8")}document.addEventListener("DOMContentLoaded",A);
