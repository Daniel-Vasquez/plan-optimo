import{g as L,a as F,b as B}from"./ViewTransitions.astro_astro_type_script_index_0_lang.BnoDHjx8.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";const x={fuerza:{bg:"rgba(66,222,9,0.13)",text:"#3fdd06",border:"rgba(232,255,71,0.3)"},cardio:{bg:"rgba(71,194,255,0.15)",text:"#47c2ff",border:"rgba(71,194,255,0.3)"},mixto:{bg:"rgba(255,107,53,0.15)",text:"#ff6b35",border:"rgba(255,107,53,0.3)"},descanso:{bg:"rgba(136,144,168,0.1)",text:"#8890a8",border:"rgba(136,144,168,0.2)"},voleibol:{bg:"rgba(71,194,255,0.15)",text:"#47c2ff",border:"rgba(71,194,255,0.3)"}},V={fuerza:"Fuerza",cardio:"Cardio",mixto:"Mixto",descanso:"Descanso",voleibol:"Voleibol"};let S=window.innerWidth>=1024?"month":"week",o=new Date;o.setHours(0,0,0,0);function f(t){return t.toISOString().slice(0,10)}function m(t,e){const s=new Date(t);return s.setDate(s.getDate()+e),s}function w(t){const e=new Date(t),s=e.getDay(),r=s===0?-6:1-s;return e.setDate(e.getDate()+r),e}function D(){const t=L(),e=new Date;e.setHours(0,0,0,0);const s=w(o),r=F();let i=1;if(r?.startDate){const n=new Date(r.startDate+"T00:00:00");n.setHours(0,0,0,0);const d=Math.floor((s.getTime()-n.getTime())/(1e3*60*60*24));i=Math.max(1,Math.min(16,Math.floor(d/7)+1))}const y=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];let a=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm text-muted">Semana ${i} · ${new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(s)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2">
    `;for(let n=0;n<7;n++){const d=m(s,n),p=f(d),g=t[p],v=B(p),l=g?.type||v?.type||"descanso",u=x[l]||x.descanso,c=p===f(e),b=g?.completed;a+=`
        <a href="/day/?date=${p}" class="flex flex-col items-center gap-1.5 p-2 lg:p-3 rounded-xl border transition-colors hover:border-[rgb(var(--edge)/0.2)]
          ${c?"border-blue bg-blue/5":"border-border bg-surface"}">
          <span class="text-[10px] uppercase tracking-wider text-muted">${y[n]}</span>
          <span class="text-base lg:text-lg font-bold ${c?"text-blue":"text-primary"}">${d.getDate()}</span>
          <span class="text-[9px] lg:text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style="background:${u.bg};color:${u.text}">${V[l]}</span>
          ${b?'<svg class="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>':'<svg class="w-4 h-4 text-muted2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'}
        </a>
      `}a+="</div>",document.getElementById("calendar-content").innerHTML=a,document.getElementById("prev-btn").addEventListener("click",()=>{o=m(w(o),-7),D()}),document.getElementById("next-btn").addEventListener("click",()=>{o=m(w(o),7),D()})}function k(){const t=L(),e=new Date;e.setHours(0,0,0,0);const s=o.getFullYear(),r=o.getMonth(),i=new Date(s,r,1),y=new Date(s,r+1,0),a=i.getDay(),n=a===0?-6:1-a,d=m(i,n);let g=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm font-semibold text-primary capitalize">${new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(i)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1">
        ${["L","M","X","J","V","S","D"].map(l=>`<div class="text-center text-[10px] text-muted uppercase py-1">${l}</div>`).join("")}
      </div>
      <div class="grid grid-cols-7 gap-1">
    `;const v=Math.ceil((y.getDate()+(a===0?6:a-1))/7)*7;for(let l=0;l<v;l++){const u=m(d,l),c=f(u),b=u.getMonth()===r,h=t[c],I=B(c),C=h?.type||I?.type||"descanso",$=x[C]||x.descanso,M=c===f(e),T=h?.completed;g+=`
        <a href="/day/?date=${c}" class="relative aspect-square flex flex-col items-center justify-center rounded-lg border transition-colors hover:border-[rgb(var(--edge)/0.2)] p-1
          ${M?"border-blue":"border-[rgb(var(--edge)/0.05)]"}
          ${b?"":"opacity-25"}
        " style="background:${b&&h?$.bg:"transparent"}">
          <span class="text-xs ${M?"text-blue font-bold":"text-primary"}">${u.getDate()}</span>
          ${T?`<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style="background:${$.text}"></span>`:""}
        </a>
      `}g+="</div>",document.getElementById("calendar-content").innerHTML=g,document.getElementById("prev-btn").addEventListener("click",()=>{o=new Date(o.getFullYear(),o.getMonth()-1,1),k()}),document.getElementById("next-btn").addEventListener("click",()=>{o=new Date(o.getFullYear(),o.getMonth()+1,1),k()})}function E(t){S=t,document.querySelectorAll(".toggle-btn").forEach(e=>{e.dataset.view===t?(e.classList.add("bg-surface","text-primary"),e.classList.remove("text-muted")):(e.classList.remove("bg-surface","text-primary"),e.classList.add("text-muted"))}),t==="week"?D():k()}document.addEventListener("astro:page-load",()=>{document.getElementById("view-toggle").addEventListener("click",t=>{const e=t.target.closest("[data-view]");e&&E(e.dataset.view)}),E(S)});
