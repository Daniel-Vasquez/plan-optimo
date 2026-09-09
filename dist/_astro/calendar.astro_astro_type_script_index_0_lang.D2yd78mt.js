import{f as e,n as t,o as n,x as r}from"./storage.Bgrvw4re.js";var i={fuerza:{bg:`rgba(66,222,9,0.13)`,text:`#3fdd06`,border:`rgba(232,255,71,0.3)`},cardio:{bg:`rgba(71,194,255,0.15)`,text:`#47c2ff`,border:`rgba(71,194,255,0.3)`},mixto:{bg:`rgba(255,107,53,0.15)`,text:`#ff6b35`,border:`rgba(255,107,53,0.3)`},descanso:{bg:`rgba(136,144,168,0.1)`,text:`#8890a8`,border:`rgba(136,144,168,0.2)`},voleibol:{bg:`rgba(71,194,255,0.15)`,text:`#47c2ff`,border:`rgba(71,194,255,0.3)`}},a={fuerza:`Fuerza`,cardio:`Cardio`,mixto:`Mixto`,descanso:`Descanso`,voleibol:`Voleibol`},o=window.innerWidth>=1024?`month`:`week`,s=new Date;s.setHours(0,0,0,0);function c(e){return r(e)}function l(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function u(e){let t=new Date(e),n=t.getDay(),r=n===0?-6:1-n;return t.setDate(t.getDate()+r),t}function d(){let r=t(),o=new Date;o.setHours(0,0,0,0);let f=u(s),p=n(),m=1;if(p?.startDate){let e=new Date(p.startDate+`T00:00:00`);e.setHours(0,0,0,0);let t=Math.floor((f.getTime()-e.getTime())/864e5);m=Math.max(1,Math.min(16,Math.floor(t/7)+1))}let h=[`LUN`,`MAR`,`MIÉ`,`JUE`,`VIE`,`SÁB`,`DOM`],g=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm text-muted">Semana ${m} · ${new Intl.DateTimeFormat(`es-MX`,{month:`long`,year:`numeric`}).format(f)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2">
    `;for(let t=0;t<7;t++){let n=l(f,t),s=c(n),u=r[s],d=e(s),p=u?.type||d?.type||`descanso`,m=i[p]||i.descanso,_=s===c(o),v=u?.completed;g+=`
        <a href="/day/?date=${s}" class="flex flex-col items-center gap-1.5 p-2 lg:p-3 rounded-xl border transition-colors hover:border-[rgb(var(--edge)/0.2)]
          ${_?`border-blue bg-blue/5`:`border-border bg-surface`}">
          <span class="text-[10px] uppercase tracking-wider text-muted">${h[t]}</span>
          <span class="text-base lg:text-lg font-bold ${_?`text-blue`:`text-primary`}">${n.getDate()}</span>
          <span class="text-[9px] lg:text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style="background:${m.bg};color:${m.text}">${a[p]}</span>
          ${v?`<svg class="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`:`<svg class="w-4 h-4 text-muted2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`}
        </a>
      `}g+=`</div>`,document.getElementById(`calendar-content`).innerHTML=g,document.getElementById(`prev-btn`).addEventListener(`click`,()=>{s=l(u(s),-7),d()}),document.getElementById(`next-btn`).addEventListener(`click`,()=>{s=l(u(s),7),d()})}function f(){let n=t(),r=new Date;r.setHours(0,0,0,0);let a=s.getFullYear(),o=s.getMonth(),u=new Date(a,o,1),d=new Date(a,o+1,0),p=u.getDay(),m=l(u,p===0?-6:1-p),h=`
      <div class="flex items-center justify-between mb-4">
        <button id="prev-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Anterior
        </button>
        <span class="text-sm font-semibold text-primary capitalize">${new Intl.DateTimeFormat(`es-MX`,{month:`long`,year:`numeric`}).format(u)}</span>
        <button id="next-btn" class="flex items-center gap-1 text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface2">
          Siguiente
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1">
        ${[`L`,`M`,`X`,`J`,`V`,`S`,`D`].map(e=>`<div class="text-center text-[10px] text-muted uppercase py-1">${e}</div>`).join(``)}
      </div>
      <div class="grid grid-cols-7 gap-1">
    `,g=Math.ceil((d.getDate()+(p===0?6:p-1))/7)*7;for(let t=0;t<g;t++){let a=l(m,t),s=c(a),u=a.getMonth()===o,d=n[s],f=e(s),p=i[d?.type||f?.type||`descanso`]||i.descanso,g=s===c(r),_=d?.completed;h+=`
        <a href="/day/?date=${s}" class="relative aspect-square flex flex-col items-center justify-center rounded-lg border transition-colors hover:border-[rgb(var(--edge)/0.2)] p-1
          ${g?`border-blue`:`border-[rgb(var(--edge)/0.05)]`}
          ${u?``:`opacity-25`}
        " style="background:${u&&d?p.bg:`transparent`}">
          <span class="text-xs ${g?`text-blue font-bold`:`text-primary`}">${a.getDate()}</span>
          ${_?`<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style="background:${p.text}"></span>`:``}
        </a>
      `}h+=`</div>`,document.getElementById(`calendar-content`).innerHTML=h,document.getElementById(`prev-btn`).addEventListener(`click`,()=>{s=new Date(s.getFullYear(),s.getMonth()-1,1),f()}),document.getElementById(`next-btn`).addEventListener(`click`,()=>{s=new Date(s.getFullYear(),s.getMonth()+1,1),f()})}function p(e){o=e,document.querySelectorAll(`.toggle-btn`).forEach(t=>{t.dataset.view===e?(t.classList.add(`bg-surface`,`text-primary`),t.classList.remove(`text-muted`)):(t.classList.remove(`bg-surface`,`text-primary`),t.classList.add(`text-muted`))}),e===`week`?d():f()}document.addEventListener(`astro:page-load`,()=>{document.getElementById(`view-toggle`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&p(t.dataset.view)}),p(o)});