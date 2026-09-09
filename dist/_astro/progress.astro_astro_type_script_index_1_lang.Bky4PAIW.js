import{a as e,c as t,h as n,i as r,m as i,p as a,r as o,u as s}from"./storage.Bgrvw4re.js";function c(e){if(!e)return null;let[t,n]=e.split(`:`).map(Number);return isNaN(t)||isNaN(n)?null:t*60+n}function l(e){let t=new Date(e+`T00:00:00`);return new Intl.DateTimeFormat(`es-MX`,{month:`short`,day:`numeric`}).format(t)}function u(e){return`
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <svg class="w-10 h-10 text-muted2 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <p class="text-sm text-muted">${e}</p>
      </div>
    `}function d(e,t,n,r=``){return`
      <div class="bg-surface border border-border rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-0.5">${e}</h2>
        <p class="text-xs text-muted mb-4">${t}</p>
        <div id="${n}-wrapper"></div>
        ${r}
      </div>
    `}function f(e){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()}function p(e){return`rgb(${f(`--color-`+e)})`}function m(e){return`rgb(${f(`--edge`)} / ${e})`}function h(e,t,n,r,i,a,o){if(!window.Chart){setTimeout(()=>h(e,t,n,r,i,a,o),200);return}let s=document.getElementById(`${e}-wrapper`);if(!s)return;if(t.length<2){s.innerHTML=u(`Aún no hay suficientes datos registrados.`);return}s.innerHTML=`<canvas id="${e}" class="w-full"></canvas>`;let c=document.getElementById(e),l=[];o!==void 0&&l.push({id:`refline`,afterDraw(e){let{ctx:t,chartArea:n,scales:r}=e,i=r.y.getPixelForValue(o);t.save(),t.setLineDash([4,4]),t.strokeStyle=m(.2),t.lineWidth=1,t.beginPath(),t.moveTo(n.left,i),t.lineTo(n.right,i),t.stroke(),t.restore()}}),new Chart(c,{type:`line`,plugins:l,data:{labels:t,datasets:[{data:n,borderColor:r,backgroundColor:a?r+`1a`:`transparent`,fill:a,tension:.4,pointBackgroundColor:r,pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!0,aspectRatio:window.innerWidth<640?1.6:2.5,interaction:{mode:`index`,intersect:!1},scales:{x:{grid:{color:m(.07)},ticks:{color:p(`muted`),font:{family:`DM Sans`,size:11},maxTicksLimit:8}},y:{reverse:i,grid:{color:m(.07)},ticks:{color:p(`muted`),font:{family:`DM Sans`,size:11},callback:i?e=>`${Math.floor(e/60)}:${Math.round(e%60).toString().padStart(2,`0`)}`:e=>+parseFloat(e).toFixed(2)}}},plugins:{legend:{display:!1},tooltip:{backgroundColor:p(`surface2`),titleColor:p(`primary`),bodyColor:p(`muted`),borderColor:m(.13),borderWidth:1,padding:10,callbacks:i?{label:e=>{let t=e.raw;return` ${Math.floor(t/60)}:${Math.round(t%60).toString().padStart(2,`0`)} min/km`}}:{label:e=>` ${+parseFloat(e.raw).toFixed(2)}`}}}}})}function g(){let u=s(12),f=n(14),p=a(),m=t(),g=r(),_=Math.round(i()*10)/10,v=o(7),y=e(),b=u.filter(e=>e.running?.pace).map(e=>l(e.date)),x=u.filter(e=>e.running?.pace).map(e=>c(e.running.pace)),S=u.filter(e=>e.running?.distance).map(e=>l(e.date)),C=u.filter(e=>e.running?.distance).map(e=>Number(e.running.distance)),w=C.reduce((e,t)=>e+t,0),T=f.map(e=>l(e.date)),E=f.map(e=>e.water),D=`
      <div class="bg-surface border border-border rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-4">Estadísticas generales</h2>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          ${[{label:`Mejor ritmo`,value:g||`—`,unit:g?`min/km`:``},{label:`Distancia total`,value:_.toFixed(1),unit:`km`},{label:`Agua promedio (7d)`,value:v.toFixed(1),unit:`L/día`},{label:`Sesiones completadas`,value:y+`%`,unit:``},{label:`Racha actual`,value:p.toString(),unit:`días`},{label:`Racha máxima`,value:m.toString(),unit:`días`}].map(e=>`
            <div>
              <p class="text-xs text-muted uppercase tracking-wider mb-1">${e.label}</p>
              <p class="text-xl font-bold text-primary">${e.value} <span class="text-sm font-normal text-muted">${e.unit}</span></p>
            </div>
          `).join(``)}
        </div>
      </div>
    `;document.getElementById(`progress-content`).innerHTML=`
      ${d(`Ritmo en carrera`,`Últimas 12 sesiones de carrera (menor = más rápido)`,`pace-chart`)}
      ${d(`Distancia por sesión`,`Kilómetros recorridos por sesión`,`dist-chart`,`<p class="text-xs text-muted mt-3">Total acumulado: <strong class="text-primary">${w.toFixed(1)} km</strong></p>`)}
      ${d(`Agua diaria`,`Últimos 14 días · Línea de referencia en 2 L`,`water-chart`)}
      ${D}
    `,setTimeout(()=>{h(`pace-chart`,b,x,`#47c2ff`,!0,!1,void 0),h(`dist-chart`,S,C,`#47c2ff`,!1,!1,void 0),h(`water-chart`,T,E,`#47c2ff`,!1,!0,2)},100)}document.addEventListener(`astro:page-load`,g);