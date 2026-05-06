import{h as X,a as A,b as B,f as c,l as U,r as V,n as G,d as J}from"./ViewTransitions.astro_astro_type_script_index_0_lang.CHunMWS9.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";function K(){const d=X(),m=document.getElementById("dashboard-loading"),p=document.getElementById("dashboard-content");if(!d){m.textContent="",p.classList.remove("hidden");return}m.remove(),p.classList.remove("hidden");const s=new Date,o=s.toISOString().slice(0,10),a=A(),u=B(o),C=c(o),g=s.getHours(),I=g<12?"Buenos días":g<18?"Buenas tardes":"Buenas noches";document.getElementById("hero-greeting").textContent=`${I}, ${d.name}`;const x=new Intl.DateTimeFormat("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(s);document.getElementById("hero-date").textContent=x.charAt(0).toUpperCase()+x.slice(1);const b=[[4,"Base"],[8,"Construcción"],[12,"Intensificación"],[16,"Peak & Taper"]].find(([e])=>a<=e)?.[1]||"Peak & Taper",D=document.getElementById("hero-badge-row");D.innerHTML=`
      <span class="text-xs bg-surface2 text-muted px-3 py-1 rounded-full">Semana ${a} · Fase ${b}</span>
    `;const S={fuerza:"#e8ff47",cardio:"#47c2ff",mixto:"#ff6b35",descanso:"#8890a8",voleibol:"#47c2ff"},M=document.getElementById("session-type-row"),T=S[u.type]||"#8890a8";M.innerHTML=`
      <span class="font-display text-3xl" style="color:${T}">${u.label.toUpperCase()}</span>
      ${C?.completed?'<span class="text-green-400 text-sm flex items-center gap-1"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Completada</span>':""}
    `,document.getElementById("cta-btn").href=`/day/?date=${o}`,document.getElementById("week-bar-wrapper").innerHTML=`
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Semana <strong class="text-primary">${a}</strong> de 16</span>
          <span class="text-muted">${b}</span>
        </div>
        <div class="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div class="h-full bg-yellow rounded-full transition-all duration-500" style="width:${Math.round(a/16*100)}%"></div>
        </div>
      </div>
    `;const L=U(),f=V(),y=G(),l=c(o)?.water??null,E=document.getElementById("metrics-grid"),H=[{label:"Racha actual",value:L.toString(),unit:"días"},{label:"Esta semana",value:`${f.completed} / ${f.total}`,unit:"sesiones"},{label:"Último ritmo 5K",value:y||"—",unit:y?"min/km":""},{label:"Agua hoy",value:l!==null?l.toFixed(1):"—",unit:l!==null?"L":""}];E.innerHTML=H.map(e=>`
      <div class="bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex flex-col gap-1">
        <span class="text-xs text-muted uppercase tracking-wider">${e.label}</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold text-primary">${e.value}</span>
          ${e.unit?`<span class="text-sm text-muted">${e.unit}</span>`:""}
        </div>
      </div>
    `).join("");const F=document.getElementById("week-pills"),r=new Date(s),h=s.getDay(),j=h===0?-6:1-h;r.setDate(s.getDate()+j);const w=[];for(let e=0;e<7;e++){const n=new Date(r);n.setDate(r.getDate()+e);const t=n.toISOString().slice(0,10),k=c(t),P=B(t),i=t===o,O=["D","L","M","X","J","V","S"][n.getDay()],z=n.getDate(),N={fuerza:"bg-yellow",cardio:"bg-blue",mixto:"bg-orange",descanso:"bg-muted",voleibol:"bg-blue"}[k?.type||P?.type]||"bg-muted2",R=i?"border-2 border-yellow bg-yellow/5":"border border-[rgba(255,255,255,0.07)] bg-[#161920]",W=k?.completed?'<svg class="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':`<span class="w-2 h-2 rounded-full ${N}"></span>`;w.push(`
        <a href="/day/?date=${t}" class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px] flex-shrink-0 ${R}">
          <span class="text-[10px] uppercase tracking-wider ${i?"text-yellow":"text-muted"}">${O}</span>
          <span class="text-sm font-semibold ${i?"text-yellow":"text-primary"}">${z}</span>
          ${W}
        </a>
      `)}F.innerHTML=w.join("");const v=J().slice(0,3),$=document.getElementById("notes-list");v.length===0?$.innerHTML=`
        <div class="bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p class="text-sm text-muted">No hay notas aún.</p>
          <a href="/notes" class="text-xs text-yellow mt-1 inline-block hover:underline">Crear primera nota →</a>
        </div>
      `:$.innerHTML=v.map(e=>{const n=new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(new Date(e.date+"T00:00:00")),t=(e.content||"").slice(0,80)+((e.content||"").length>80?"…":"");return`
          <a href="/notes" class="block bg-surface border border-[rgba(255,255,255,0.07)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.13)] transition-colors">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm font-semibold text-primary truncate">${e.title||"Sin título"}</h3>
              <span class="text-[10px] text-muted2 flex-shrink-0">${n}</span>
            </div>
            ${t?`<p class="text-xs text-muted mt-1 line-clamp-2">${t}</p>`:""}
          </a>
        `}).join("")}document.addEventListener("astro:page-load",K);
