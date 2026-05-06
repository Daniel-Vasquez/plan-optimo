import{j as w,k,l as $,m as S,n as C,o as M,p as T,q as D}from"./ViewTransitions.astro_astro_type_script_index_0_lang.CHunMWS9.js";import"https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";function L(e){if(!e)return null;const[r,s]=e.split(":").map(Number);return isNaN(r)||isNaN(s)?null:r*60+s}function x(e){const r=new Date(e+"T00:00:00");return new Intl.DateTimeFormat("es-MX",{month:"short",day:"numeric"}).format(r)}function R(e){return`
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <svg class="w-10 h-10 text-muted2 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <p class="text-sm text-muted">${e}</p>
      </div>
    `}function h(e,r,s,n=""){return`
      <div class="bg-[#161920] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-0.5">${e}</h2>
        <p class="text-xs text-muted mb-4">${r}</p>
        <div id="${s}-wrapper"></div>
        ${n}
      </div>
    `}function f(e,r,s,n,c,l,d){if(!window.Chart){setTimeout(()=>f(e,r,s,n,c,l,d),200);return}const u=document.getElementById(`${e}-wrapper`);if(!u)return;if(r.length<2){u.innerHTML=R("Aún no hay suficientes datos registrados.");return}u.innerHTML=`<canvas id="${e}" class="w-full"></canvas>`;const b=document.getElementById(e),p=[];d!==void 0&&p.push({id:"refline",afterDraw(o){const{ctx:a,chartArea:i,scales:m}=o,g=m.y.getPixelForValue(d);a.save(),a.setLineDash([4,4]),a.strokeStyle="rgba(255,255,255,0.2)",a.lineWidth=1,a.beginPath(),a.moveTo(i.left,g),a.lineTo(i.right,g),a.stroke(),a.restore()}}),new Chart(b,{type:"line",plugins:p,data:{labels:r,datasets:[{data:s,borderColor:n,backgroundColor:l?n+"1a":"transparent",fill:l,tension:.4,pointBackgroundColor:n,pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!0,aspectRatio:window.innerWidth<640?1.6:2.5,interaction:{mode:"index",intersect:!1},scales:{x:{grid:{color:"rgba(255,255,255,0.07)"},ticks:{color:"#8890a8",font:{family:"DM Sans",size:11},maxTicksLimit:8}},y:{reverse:c,grid:{color:"rgba(255,255,255,0.07)"},ticks:{color:"#8890a8",font:{family:"DM Sans",size:11},callback:c?o=>{const a=Math.floor(o/60),i=Math.round(o%60).toString().padStart(2,"0");return`${a}:${i}`}:void 0}}},plugins:{legend:{display:!1},tooltip:{backgroundColor:"#1e2230",titleColor:"#f0f2f8",bodyColor:"#8890a8",borderColor:"rgba(255,255,255,0.13)",borderWidth:1,padding:10,callbacks:c?{label:o=>{const a=o.raw,i=Math.floor(a/60),m=Math.round(a%60).toString().padStart(2,"0");return` ${i}:${m} min/km`}}:{}}}}})}function A(){const e=w(12),r=k(14),s=$(),n=S(),c=C(),l=Math.round(M()*10)/10,d=T(7),u=D(),b=e.filter(t=>t.running?.pace).map(t=>x(t.date)),p=e.filter(t=>t.running?.pace).map(t=>L(t.running.pace)),o=e.filter(t=>t.running?.distance).map(t=>x(t.date)),a=e.filter(t=>t.running?.distance).map(t=>Number(t.running.distance)),i=a.reduce((t,y)=>t+y,0),m=r.map(t=>x(t.date)),g=r.map(t=>t.water),v=`
      <div class="bg-[#161920] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 lg:p-6">
        <h2 class="text-sm font-semibold text-primary mb-4">Estadísticas generales</h2>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          ${[{label:"Mejor ritmo",value:c||"—",unit:c?"min/km":""},{label:"Distancia total",value:l.toFixed(1),unit:"km"},{label:"Agua promedio (7d)",value:d.toFixed(1),unit:"L/día"},{label:"Sesiones completadas",value:u+"%",unit:""},{label:"Racha actual",value:s.toString(),unit:"días"},{label:"Racha máxima",value:n.toString(),unit:"días"}].map(t=>`
            <div>
              <p class="text-xs text-muted uppercase tracking-wider mb-1">${t.label}</p>
              <p class="text-xl font-bold text-primary">${t.value} <span class="text-sm font-normal text-muted">${t.unit}</span></p>
            </div>
          `).join("")}
        </div>
      </div>
    `;document.getElementById("progress-content").innerHTML=`
      ${h("Ritmo en carrera","Últimas 12 sesiones de carrera (menor = más rápido)","pace-chart")}
      ${h("Distancia por sesión","Kilómetros recorridos por sesión","dist-chart",`<p class="text-xs text-muted mt-3">Total acumulado: <strong class="text-primary">${i.toFixed(1)} km</strong></p>`)}
      ${h("Agua diaria","Últimos 14 días · Línea de referencia en 2 L","water-chart")}
      ${v}
    `,setTimeout(()=>{f("pace-chart",b,p,"#47c2ff",!0,!1,void 0),f("dist-chart",o,a,"#47c2ff",!1,!1,void 0),f("water-chart",m,g,"#47c2ff",!1,!0,2)},100)}document.addEventListener("astro:page-load",A);
