import{d as e,f as t,g as n,i as r,l as i,o as a,p as o,s,x as c}from"./storage.Bgrvw4re.js";function l(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function u(){let u=a(),d=document.getElementById(`dashboard-loading`),f=document.getElementById(`dashboard-content`);if(!u){d.textContent=``,f.classList.remove(`hidden`);return}d.remove(),f.classList.remove(`hidden`);let p=new Date,m=p.getHours();p.setHours(0,0,0,0);let h=c(p),g=s(),_=t(h),v=e(h),y=m<12?`Buenos días`:m<18?`Buenas tardes`:`Buenas noches`;document.getElementById(`hero-greeting`).textContent=`${y}, ${u.name}`;let b=new Intl.DateTimeFormat(`es-MX`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`}).format(p);document.getElementById(`hero-date`).textContent=b.charAt(0).toUpperCase()+b.slice(1);let x=[[4,`Base`],[8,`Construcción`],[12,`Intensificación`],[16,`Peak & Taper`]].find(([e])=>g<=e)?.[1]||`Peak & Taper`,S=document.getElementById(`hero-badge-row`);S.innerHTML=`
      <span class="text-xs bg-surface2 text-muted px-3 py-1 rounded-full">Semana ${g} · Fase ${x}</span>
    `;let C={fuerza:`#e8ff47`,cardio:`#47c2ff`,mixto:`#ff6b35`,descanso:`#8890a8`,voleibol:`#47c2ff`},w=document.getElementById(`session-type-row`);w.innerHTML=`
      <span class="font-display text-3xl" style="color:${C[_.type]||`#8890a8`}">${_.label.toUpperCase()}</span>
      ${v?.completed?`<span class="text-green-400 text-sm flex items-center gap-1"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Completada</span>`:``}
    `,document.getElementById(`cta-btn`).href=`/day/?date=${h}`;let T=new Date(u.startDate+`T00:00:00`);T.setHours(0,0,0,0);let E=Math.floor((p.getTime()-T.getTime())/864e5),D=Math.max(0,112-E),O=D===0?`¡Plan completado!`:`${D} días restantes`;document.getElementById(`week-bar-wrapper`).innerHTML=`
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted">Semana <strong class="text-primary">${g}</strong> de 16</span>
          <span class="text-muted">${x}</span>
        </div>
        <div class="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div class="h-full bg-blue rounded-full transition-all duration-500" style="width:${Math.round(g/16*100)}%"></div>
        </div>
        <div class="text-[11px] text-muted2 text-right">${O}</div>
      </div>
    `;let k=o(),A=n(),j=r(),M=e(h)?.water??null,N=document.getElementById(`metrics-grid`);N.innerHTML=[{label:`Racha actual`,value:k.toString(),unit:`días`},{label:`Esta semana`,value:`${A.completed} / ${A.total}`,unit:`sesiones`},{label:`Último ritmo 5K`,value:j||`—`,unit:j?`min/km`:``},{label:`Agua hoy`,value:M===null?`—`:M.toFixed(1),unit:M===null?``:`L`}].map(e=>`
      <div class="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
        <span class="text-xs text-muted uppercase tracking-wider">${e.label}</span>
        <div class="flex items-baseline gap-1 mt-1">
          <span class="text-2xl font-bold text-primary">${e.value}</span>
          ${e.unit?`<span class="text-sm text-muted">${e.unit}</span>`:``}
        </div>
      </div>
    `).join(``);let P=document.getElementById(`week-pills`),F=new Date(p),I=p.getDay(),L=I===0?-6:1-I;F.setDate(p.getDate()+L);let R=[];for(let n=0;n<7;n++){let r=new Date(F);r.setDate(F.getDate()+n);let i=c(r),a=e(i),o=t(i),s=i===h,l=[`D`,`L`,`M`,`X`,`J`,`V`,`S`][r.getDay()],u=r.getDate(),d={fuerza:`bg-green-300`,cardio:`bg-blue`,mixto:`bg-orange`,descanso:`bg-muted`,voleibol:`bg-blue`}[a?.type||o?.type]||`bg-muted2`,f=s?`border-2 border-blue bg-yellow/5`:`border border-border bg-surface`,p=a?.completed?`<svg class="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`:`<span class="w-2 h-2 rounded-full ${d}"></span>`;R.push(`
        <a href="/day/?date=${i}" class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px] flex-shrink-0 ${f}">
          <span class="text-[10px] uppercase tracking-wider ${s?`text-blue`:`text-muted`}">${l}</span>
          <span class="text-sm font-semibold ${s?`text-blue`:`text-primary`}">${u}</span>
          ${p}
        </a>
      `)}P.innerHTML=R.join(``);let z=i().slice(0,3),B=document.getElementById(`notes-list`);B.innerHTML=z.length===0?`
        <div class="bg-surface border border-border rounded-xl p-6 text-center">
          <svg class="w-8 h-8 text-muted2 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p class="text-sm text-muted">No hay notas aún.</p>
          <a href="/notes" class="text-xs text-yellow mt-1 inline-block hover:underline">Crear primera nota →</a>
        </div>
      `:z.map(e=>{let t=new Intl.DateTimeFormat(`es-MX`,{month:`short`,day:`numeric`}).format(new Date(e.date+`T00:00:00`)),n=(e.content||``).slice(0,80)+((e.content||``).length>80?`…`:``);return`
          <a href="/notes" class="block bg-surface border border-border rounded-xl p-4 hover:border-border2 transition-colors">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-sm font-semibold text-primary truncate">${l(e.title||`Sin título`)}</h3>
              <span class="text-[10px] text-muted2 flex-shrink-0">${t}</span>
            </div>
            ${n?`<p class="text-xs text-muted mt-1 line-clamp-2">${l(n)}</p>`:``}
          </a>
        `}).join(``)}document.addEventListener(`astro:page-load`,u);