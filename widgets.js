function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === path) link.classList.add('active');
  });
}

function setImageFallback(img, label) {
  const wrapper = img.parentElement;
  if (!wrapper) return;
  wrapper.innerHTML = `<div class="image-fallback">${label}<br>Imagen no disponible</div>`;
}

function actualizarReloj() {
  const el = document.getElementById('reloj-display');
  if (!el) return;
  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, '0');
  const m = String(ahora.getMinutes()).padStart(2, '0');
  const s = String(ahora.getSeconds()).padStart(2, '0');
  el.textContent = `${h}:${m}:${s}`;
}

async function obtenerClima() {
  const input = document.getElementById('ciudad-input');
  const box = document.getElementById('clima-resultado');
  if (!input || !box) return;
  const ciudad = input.value.trim();
  if (!ciudad) {
    box.innerHTML = '<div class="result-box">Escribe una ciudad para consultar el clima.</div>';
    return;
  }
  box.innerHTML = '<div class="result-box">Buscando ciudad y datos meteorológicos...</div>';
  try {
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`);
    const geoData = await geo.json();
    if (!geoData.results || !geoData.results.length) {
      box.innerHTML = '<div class="result-box">No he encontrado esa ciudad.</div>';
      return;
    }
    const lugar = geoData.results[0];
    const clima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lugar.latitude}&longitude=${lugar.longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`);
    const climaData = await clima.json();
    const current = climaData.current;
    let icono = '🌤️';
    const code = current.weather_code;
    if (code === 0) icono = '☀️';
    else if ([1,2].includes(code)) icono = '🌤️';
    else if (code === 3) icono = '☁️';
    else if ([45,48].includes(code)) icono = '🌫️';
    else if (code >= 51 && code <= 67) icono = '🌧️';
    else if (code >= 71 && code <= 77) icono = '❄️';
    else if (code >= 80) icono = '⛈️';

    box.innerHTML = `
      <div class="result-box">
        <div style="font-size:2.1rem; margin-bottom:10px;">${icono}</div>
        <strong>${lugar.name}${lugar.country ? `, ${lugar.country}` : ''}</strong>
        <p style="margin:10px 0 0;">${current.temperature_2m} °C · Humedad ${current.relative_humidity_2m}% · Viento ${current.wind_speed_10m} km/h</p>
      </div>`;
  } catch (e) {
    box.innerHTML = '<div class="result-box">No se ha podido cargar el clima ahora mismo.</div>';
  }
}

async function convertirMoneda() {
  const amount = Number(document.getElementById('monto')?.value || 0);
  const origen = document.getElementById('moneda-origen')?.value || 'EUR';
  const box = document.getElementById('resultado-moneda');
  if (!box) return;
  if (!amount || amount <= 0) {
    box.innerHTML = '<div class="result-box">Introduce una cantidad válida.</div>';
    return;
  }
  box.innerHTML = '<div class="result-box">Cargando tipos de cambio...</div>';
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(origen)}`);
    const data = await res.json();
    const rates = data.rates || {};
    const monedas = ['EUR','USD','GBP','JPY','MXN','ARS','CNY','CLP'];
    const rows = monedas
      .filter(m => rates[m])
      .map(m => `<div class="break-item"><span class="value">${(amount * rates[m]).toFixed(2)}</span><span class="label">${m}</span></div>`)
      .join('');
    box.innerHTML = `<div class="result-box"><strong>${amount} ${origen}</strong><div class="breakdown">${rows}</div></div>`;
  } catch (e) {
    box.innerHTML = '<div class="result-box">No se han podido obtener las tasas de cambio.</div>';
  }
}

async function obtenerCita() {
  const text = document.getElementById('cita-texto');
  const author = document.getElementById('cita-autor');
  if (!text || !author) return;
  text.textContent = 'Cargando consejo...';
  author.textContent = '';
  try {
    const res = await fetch('https://api.adviceslip.com/advice', { cache: 'no-store' });
    const data = await res.json();
    text.textContent = `“${data.slip.advice}”`;
    author.textContent = '— Consejo del día';
  } catch (e) {
    text.textContent = 'No se ha podido cargar la cita.';
  }
}

async function obtenerChiste() {
  const el = document.getElementById('chiste-texto');
  if (!el) return;
  el.textContent = 'Cargando chiste...';
  try {
    const res = await fetch('https://api.chucknorris.io/jokes/random');
    const data = await res.json();
    el.textContent = data.value || 'No hay chiste disponible.';
  } catch (e) {
    el.textContent = 'No se ha podido cargar el chiste.';
  }
}

function cargarImagenes() {
  const grid = document.getElementById('imagenes-grid');
  if (!grid) return;
  const imagenes = [
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80'
  ];
  grid.innerHTML = imagenes.map((src, index) => `<img src="${src}" alt="Imagen ${index + 1}" loading="lazy">`).join('');
}

function calcularNota() {
  const notaBach = parseFloat(document.getElementById('nota_bach').value) || 0;
  const lengua = parseFloat(document.getElementById('lengua').value) || 0;
  const valencia = parseFloat(document.getElementById('valencia').value) || 0;
  const idioma = parseFloat(document.getElementById('idioma').value) || 0;
  const historia = parseFloat(document.getElementById('historia').value) || 0;
  const modalidad = parseFloat(document.getElementById('modalidad').value) || 0;
  const esp1 = parseFloat(document.getElementById('especifica1').value) || 0;
  const esp2 = parseFloat(document.getElementById('especifica2').value) || 0;
  const status = document.getElementById('mensaje');
  const notaFinal = document.getElementById('nota_final');

  const notas = [notaBach, lengua, valencia, idioma, historia, modalidad, esp1, esp2];
  if (notas.some(n => n < 0 || n > 10)) {
    status.textContent = 'Las notas deben estar entre 0 y 10.';
    status.style.borderColor = 'rgba(255,110,110,0.4)';
    status.style.background = 'rgba(255,110,110,0.12)';
    return;
  }

  const mediaFase = (lengua + valencia + idioma + historia + modalidad) / 5;
  const aportacionBach = notaBach * 0.6;
  const aportacionFase = mediaFase * 0.4;
  const notaBase = aportacionBach + aportacionFase;
  const extra1 = esp1 >= 5 ? esp1 * 0.2 : 0;
  const extra2 = esp2 >= 5 ? esp2 * 0.2 : 0;
  const puntosExtra = extra1 + extra2;
  const admision = notaBase + puntosExtra;

  notaFinal.textContent = admision.toFixed(3);
  document.getElementById('res_bach').textContent = aportacionBach.toFixed(2);
  document.getElementById('res_fase').textContent = aportacionFase.toFixed(2);
  document.getElementById('res_base').textContent = notaBase.toFixed(3);
  document.getElementById('res_extra').textContent = `+${puntosExtra.toFixed(2)}`;

  let msg = 'Sigue comparando notas de corte y grados.';
  if (admision >= 13) msg = 'Muy alta: puedes optar a carreras muy competitivas.';
  else if (admision >= 11) msg = 'Muy buena: tienes bastantes opciones de acceso.';
  else if (admision >= 9) msg = 'Buena: revisa bien las ponderaciones de tu grado.';
  else if (admision >= 7) msg = 'Aceptable: conviene mirar grados con corte media.';

  status.textContent = msg;
  status.style.borderColor = 'rgba(78,227,193,0.35)';
  status.style.background = 'rgba(78,227,193,0.08)';
}

window.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  actualizarReloj();
  setInterval(actualizarReloj, 1000);
  if (document.getElementById('cita-texto')) obtenerCita();
  if (document.getElementById('imagenes-grid')) cargarImagenes();
  if (document.getElementById('chiste-texto')) obtenerChiste();
});
