import{g as L,a as T,b as B}from"./ViewTransitions.astro_astro_type_script_index_0_lang.DxLj3x3s.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";import"./Toast.astro_astro_type_script_index_0_lang.BMihgS09.js";const x={fuerza:{bg:"rgba(232,255,71,0.15)",text:"#e8ff47",border:"rgba(232,255,71,0.3)"},cardio:{bg:"rgba(71,194,255,0.15)",text:"#47c2ff",border:"rgba(71,194,255,0.3)"},mixto:{bg:"rgba(255,107,53,0.15)",text:"#ff6b35",border:"rgba(255,107,53,0.3)"},descanso:{bg:"rgba(136,144,168,0.1)",text:"#8890a8",border:"rgba(136,144,168,0.2)"},voleibol:{bg:"rgba(71,194,255,0.15)",text:"#47c2ff",border:"rgba(71,194,255,0.3)"}},V={fuerza:"Fuerza",cardio:"Cardio",mixto:"Mixto",descanso:"Descanso",voleibol:"Voleibol"};let S=window.innerWidth>=1024?"month":"week",o=new Date;o.setHours(0,0,0,0);function y(t){return t.toISOString().slice(0,10)}function u(t,e){const s=new Date(t);return s.setDate(s.getDate()+e),s}function w(t){const e=new Date(t),s=e.getDay(),a=s===0?-6:1-s;return e.setDate(e.getDate()+a),e}function h(){const t=L(),e=new Date;e.setHours(0,0,0,0);const s=w(o),a=T(),d=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];let g=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm text-muted">Semana ${a} · ${new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(s)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2">
    `;for(let n=0;n<7;n++){const m=u(s,n),l=y(m),f=t[l],p=B(l),b=f?.type||p?.type||"descanso",r=x[b]||x.descanso,c=l===y(e),i=f?.completed;g+=`
        <a href="/day/?date=${l}" class="flex flex-col items-center gap-1.5 p-2 lg:p-3 rounded-xl border transition-colors hover:border-[rgba(255,255,255,0.2)]
          ${c?"border-yellow/50 bg-yellow/5":"border-[rgba(255,255,255,0.07)] bg-[#161920]"}">
          <span class="text-[10px] uppercase tracking-wider text-muted">${d[n]}</span>
          <span class="text-base lg:text-lg font-bold ${c?"text-yellow":"text-primary"}">${m.getDate()}</span>
          <span class="text-[9px] lg:text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style="background:${r.bg};color:${r.text}">${V[b]}</span>
          ${i?'<svg class="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>':'<svg class="w-4 h-4 text-muted2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'}
        </a>
      `}g+="</div>",document.getElementById("calendar-content").innerHTML=g,document.getElementById("prev-btn").addEventListener("click",()=>{o=u(w(o),-7),h()}),document.getElementById("next-btn").addEventListener("click",()=>{o=u(w(o),7),h()})}function D(){const t=L(),e=new Date;e.setHours(0,0,0,0);const s=o.getFullYear(),a=o.getMonth(),d=new Date(s,a,1),g=new Date(s,a+1,0),n=d.getDay(),m=n===0?-6:1-n,l=u(d,m);let p=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm font-semibold text-primary capitalize">${new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(d)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1">
        ${["L","M","X","J","V","S","D"].map(r=>`<div class="text-center text-[10px] text-muted uppercase py-1">${r}</div>`).join("")}
      </div>
      <div class="grid grid-cols-7 gap-1">
    `;const b=Math.ceil((g.getDate()+(n===0?6:n-1))/7)*7;for(let r=0;r<b;r++){const c=u(l,r),i=y(c),k=c.getMonth()===a,v=t[i],I=B(i),C=v?.type||I?.type||"descanso",$=x[C]||x.descanso,M=i===y(e),F=v?.completed;p+=`
        <a href="/day/?date=${i}" class="relative aspect-square flex flex-col items-center justify-center rounded-lg border transition-colors hover:border-[rgba(255,255,255,0.2)] p-1
          ${M?"border-yellow/60":"border-[rgba(255,255,255,0.05)]"}
          ${k?"":"opacity-25"}
        " style="background:${k&&v?$.bg:"transparent"}">
          <span class="text-xs ${M?"text-yellow font-bold":"text-primary"}">${c.getDate()}</span>
          ${F?`<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style="background:${$.text}"></span>`:""}
        </a>
      `}p+="</div>",document.getElementById("calendar-content").innerHTML=p,document.getElementById("prev-btn").addEventListener("click",()=>{o=new Date(o.getFullYear(),o.getMonth()-1,1),D()}),document.getElementById("next-btn").addEventListener("click",()=>{o=new Date(o.getFullYear(),o.getMonth()+1,1),D()})}function E(t){S=t,document.querySelectorAll(".toggle-btn").forEach(e=>{e.dataset.view===t?(e.classList.add("bg-surface","text-primary"),e.classList.remove("text-muted")):(e.classList.remove("bg-surface","text-primary"),e.classList.add("text-muted"))}),t==="week"?h():D()}document.addEventListener("DOMContentLoaded",()=>{document.getElementById("view-toggle").addEventListener("click",t=>{const e=t.target.closest("[data-view]");e&&E(e.dataset.view)}),E(S)});
