import{j as C,k as S,l as M,m as T,n as D,o as R,p as L,q as F}from"./ViewTransitions.astro_astro_type_script_index_0_lang.BnoDHjx8.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";function A(e){if(!e)return null;const[r,s]=e.split(":").map(Number);return isNaN(r)||isNaN(s)?null:r*60+s}function v(e){const r=new Date(e+"T00:00:00");return new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(r)}function B(e){return`
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <svg class="w-10 h-10 text-muted2 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <p class="text-sm text-muted">${e}</p>
      </div>
    `}function y(e,r,s,o=""){return`
      <div class="bg-surface border border-border rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-0.5">${e}</h2>
        <p class="text-xs text-muted mb-4">${r}</p>
        <div id="${s}-wrapper"></div>
        ${o}
      </div>
    `}function w(e){return getComputedStyle(document.documentElement).getPropertyValue(e).trim()}function p(e){return`rgb(${w("--color-"+e)})`}function b(e){return`rgb(${w("--edge")} / ${e})`}function x(e,r,s,o,c,l,d){if(!window.Chart){setTimeout(()=>x(e,r,s,o,c,l,d),200);return}const u=document.getElementById(`${e}-wrapper`);if(!u)return;if(r.length<2){u.innerHTML=B("Aún no hay suficientes datos registrados.");return}u.innerHTML=`<canvas id="${e}" class="w-full"></canvas>`;const h=document.getElementById(e),g=[];d!==void 0&&g.push({id:"refline",afterDraw(n){const{ctx:a,chartArea:i,scales:m}=n,f=m.y.getPixelForValue(d);a.save(),a.setLineDash([4,4]),a.strokeStyle=b(.2),a.lineWidth=1,a.beginPath(),a.moveTo(i.left,f),a.lineTo(i.right,f),a.stroke(),a.restore()}}),new Chart(h,{type:"line",plugins:g,data:{labels:r,datasets:[{data:s,borderColor:o,backgroundColor:l?o+"1a":"transparent",fill:l,tension:.4,pointBackgroundColor:o,pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!0,aspectRatio:window.innerWidth<640?1.6:2.5,interaction:{mode:"index",intersect:!1},scales:{x:{grid:{color:b(.07)},ticks:{color:p("muted"),font:{family:"DM Sans",size:11},maxTicksLimit:8}},y:{reverse:c,grid:{color:b(.07)},ticks:{color:p("muted"),font:{family:"DM Sans",size:11},callback:c?n=>{const a=Math.floor(n/60),i=Math.round(n%60).toString().padStart(2,"0");return`${a}:${i}`}:n=>+parseFloat(n).toFixed(2)}}},plugins:{legend:{display:!1},tooltip:{backgroundColor:p("surface2"),titleColor:p("primary"),bodyColor:p("muted"),borderColor:b(.13),borderWidth:1,padding:10,callbacks:c?{label:n=>{const a=n.raw,i=Math.floor(a/60),m=Math.round(a%60).toString().padStart(2,"0");return` ${i}:${m} min/km`}}:{label:n=>` ${+parseFloat(n.raw).toFixed(2)}`}}}}})}function H(){const e=C(12),r=S(14),s=M(),o=T(),c=D(),l=Math.round(R()*10)/10,d=L(7),u=F(),h=e.filter(t=>t.running?.pace).map(t=>v(t.date)),g=e.filter(t=>t.running?.pace).map(t=>A(t.running.pace)),n=e.filter(t=>t.running?.distance).map(t=>v(t.date)),a=e.filter(t=>t.running?.distance).map(t=>Number(t.running.distance)),i=a.reduce((t,k)=>t+k,0),m=r.map(t=>v(t.date)),f=r.map(t=>t.water),$=`
      <div class="bg-surface border border-border rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-4">Estadísticas generales</h2>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          ${[{label:"Mejor ritmo",value:c||"—",unit:c?"min/km":""},{label:"Distancia total",value:l.toFixed(1),unit:"km"},{label:"Agua promedio (7d)",value:d.toFixed(1),unit:"L/día"},{label:"Sesiones completadas",value:u+"%",unit:""},{label:"Racha actual",value:s.toString(),unit:"días"},{label:"Racha máxima",value:o.toString(),unit:"días"}].map(t=>`
            <div>
              <p class="text-xs text-muted uppercase tracking-wider mb-1">${t.label}</p>
              <p class="text-xl font-bold text-primary">${t.value} <span class="text-sm font-normal text-muted">${t.unit}</span></p>
            </div>
          `).join("")}
        </div>
      </div>
    `;document.getElementById("progress-content").innerHTML=`
      ${y("Ritmo en carrera","Últimas 12 sesiones de carrera (menor = más rápido)","pace-chart")}
      ${y("Distancia por sesión","Kilómetros recorridos por sesión","dist-chart",`<p class="text-xs text-muted mt-3">Total acumulado: <strong class="text-primary">${i.toFixed(1)} km</strong></p>`)}
      ${y("Agua diaria","Últimos 14 días · Línea de referencia en 2 L","water-chart")}
      ${$}
    `,setTimeout(()=>{x("pace-chart",h,g,"#47c2ff",!0,!1,void 0),x("dist-chart",n,a,"#47c2ff",!1,!1,void 0),x("water-chart",m,f,"#47c2ff",!1,!0,2)},100)}document.addEventListener("astro:page-load",H);
