import{a as G,h as J,b as D,f as i,l as K,r as Q,n as Y,d as Z}from"./ViewTransitions.astro_astro_type_script_index_0_lang.BnoDHjx8.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";function I(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function _(){const a=G(),p=document.getElementById("dashboard-loading"),m=document.getElementById("dashboard-content");if(!a){p.textContent="",m.classList.remove("hidden");return}p.remove(),m.classList.remove("hidden");const t=new Date,u=t.getHours();t.setHours(0,0,0,0);const o=t.toISOString().slice(0,10),l=J(),g=D(o),S=i(o),T=u<12?"Buenos días":u<18?"Buenas tardes":"Buenas noches";document.getElementById("hero-greeting").textContent=`${T}, ${a.name}`;const x=new Intl.DateTimeFormat("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(t);document.getElementById("hero-date").textContent=x.charAt(0).toUpperCase()+x.slice(1);const b=[[4,"Base"],[8,"Construcción"],[12,"Intensificación"],[16,"Peak & Taper"]].find(([e])=>l<=e)?.[1]||"Peak & Taper",M=document.getElementById("hero-badge-row");M.innerHTML=`
      <span class="text-xs bg-surface2 text-muted px-3 py-1 rounded-full">Semana ${l} · Fase ${b}</span>
    `;const L={fuerza:"#e8ff47",cardio:"#47c2ff",mixto:"#ff6b35",descanso:"#8890a8",voleibol:"#47c2ff"},E=document.getElementById("session-type-row"),H=L[g.type]||"#8890a8";E.innerHTML=`
      <span class="font-display text-3xl" style="color:${H}">${g.label.toUpperCase()}</span>
      ${S?.completed?'<span class="text-green-400 text-sm flex items-center gap-1"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Completada</span>':""}
    `,document.getElementById("cta-btn").href=`/day/?date=${o}`;const f=new Date(a.startDate+"T00:00:00");f.setHours(0,0,0,0);const F=Math.floor((t.getTime()-f.getTime())/(1e3*60*60*24)),y=Math.max(0,16*7-F),P=y===0?"¡Plan completado!":`${y} días restantes`;document.getElementById("week-bar-wrapper").innerHTML=`
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Semana <strong class="text-primary">${l}</strong> de 16</span>
          <span class="text-muted">${b}</span>
        </div>
        <div class="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div class="h-full bg-blue rounded-full transition-all duration-500" style="width:${Math.round(l/16*100)}%"></div>
        </div>
        <div class="text-[11px] text-muted2 text-right">${P}</div>
      </div>
    `;const j=K(),h=Q(),v=Y(),r=i(o)?.water??null,O=document.getElementById("metrics-grid"),R=[{label:"Racha actual",value:j.toString(),unit:"días"},{label:"Esta semana",value:`${h.completed} / ${h.total}`,unit:"sesiones"},{label:"Último ritmo 5K",value:v||"—",unit:v?"min/km":""},{label:"Agua hoy",value:r!==null?r.toFixed(1):"—",unit:r!==null?"L":""}];O.innerHTML=R.map(e=>`
      <div class="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
        <span class="text-xs text-muted uppercase tracking-wider">${e.label}</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold text-primary">${e.value}</span>
          ${e.unit?`<span class="text-sm text-muted">${e.unit}</span>`:""}
        </div>
      </div>
    `).join("");const z=document.getElementById("week-pills"),c=new Date(t),w=t.getDay(),N=w===0?-6:1-w;c.setDate(t.getDate()+N);const $=[];for(let e=0;e<7;e++){const n=new Date(c);n.setDate(c.getDate()+e);const s=n.toISOString().slice(0,10),C=i(s),W=D(s),d=s===o,X=["D","L","M","X","J","V","S"][n.getDay()],A=n.getDate(),U={fuerza:"bg-yellow",cardio:"bg-blue",mixto:"bg-orange",descanso:"bg-muted",voleibol:"bg-blue"}[C?.type||W?.type]||"bg-muted2",V=d?"border-2 border-blue bg-yellow/5":"border border-border bg-surface",q=C?.completed?'<svg class="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':`<span class="w-2 h-2 rounded-full ${U}"></span>`;$.push(`
        <a href="/day/?date=${s}" class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px] flex-shrink-0 ${V}">
          <span class="text-[10px] uppercase tracking-wider ${d?"text-blue":"text-muted"}">${X}</span>
          <span class="text-sm font-semibold ${d?"text-blue":"text-primary"}">${A}</span>
          ${q}
        </a>
      `)}z.innerHTML=$.join("");const k=Z().slice(0,3),B=document.getElementById("notes-list");k.length===0?B.innerHTML=`
        <div class="bg-surface border border-border rounded-xl p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p class="text-sm text-muted">No hay notas aún.</p>
          <a href="/notes" class="text-xs text-yellow mt-1 inline-block hover:underline">Crear primera nota →</a>
        </div>
      `:B.innerHTML=k.map(e=>{const n=new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(new Date(e.date+"T00:00:00")),s=(e.content||"").slice(0,80)+((e.content||"").length>80?"…":"");return`
          <a href="/notes" class="block bg-surface border border-border rounded-xl p-4 hover:border-border2 transition-colors">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm font-semibold text-primary truncate">${I(e.title||"Sin título")}</h3>
              <span class="text-[10px] text-muted2 flex-shrink-0">${n}</span>
            </div>
            ${s?`<p class="text-xs text-muted mt-1 line-clamp-2">${I(s)}</p>`:""}
          </a>
        `}).join("")}document.addEventListener("astro:page-load",_);
