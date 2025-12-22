/* UTILIDAD ESCRIBIR */
function escribirTexto(el, texto, velocidad = 35) {
  el.innerHTML = "";
  el.classList.add("escribiendo");
  let i = 0;
  const int = setInterval(() => {
    el.innerHTML += texto[i];
    i++;
    if (i >= texto.length) clearInterval(int);
  }, velocidad);
}

/* BIENVENIDA */
const bienvenida = document.getElementById("bienvenida");
if (!localStorage.getItem("yaEntro")) bienvenida.classList.add("activa");

cerrarBienvenida.onclick = () => {
  bienvenida.classList.remove("activa");
  localStorage.setItem("yaEntro", "true");
};

/* CONTADOR */
function actualizarContador() {
  const inicio = new Date("2024-02-24T00:00:00");
  const ahora = new Date();
  const d = Math.floor((ahora - inicio) / 86400000);
  const h = Math.floor((ahora - inicio) / 3600000 % 24);
  const m = Math.floor((ahora - inicio) / 60000 % 60);
  const s = Math.floor((ahora - inicio) / 1000 % 60);
  contador.innerText = `Llevamos ${d} días ${h}h ${m}m ${s}s juntos 💖`;
}
setInterval(actualizarContador, 1000);
actualizarContador();

/* SENTIMIENTOS */
setTimeout(() => escribirTexto(sentimiento, "Siento calma cuando estás aquí 🤍"), 6000);
setTimeout(() => escribirTexto(sentimiento, "Siento amor del que no se va 💖"), 14000);
setTimeout(() => escribirTexto(sentimiento, "Siento que quiero quedarme contigo 🥺"), 22000);

/* POR QUÉ TE AMO */
function mostrarPorque() {
  const frases = [
    "Te amo por cómo me miras 🥺",
    "Te amo porque contigo soy yo",
    "Te amo incluso cuando discutimos",
    "Te amo porque eres mi hogar",
    "Te amo porque quiero un futuro contigo 💍"
  ];
  let i = 0;
  reaccion.innerText = "";

  const int = setInterval(() => {
    escribirTexto(porqueTeAmo, frases[i]);
    reaccion.innerText = "Me encanta que quieras saber esto ❤️";
    i++;
    if (i >= frases.length) clearInterval(int);
  }, 2600);
}

/* FUTURO */
function mostrarFuturo() {
  futuro.innerHTML = "";
  const ideas = [
    "Despertar contigo cada mañana ☀️",
    "Arreglar las peleas con abrazos",
    "Apoyarnos cuando todo sea difícil",
    "Celebrar nuestros logros juntos",
    "Elegirte todos los días, siempre 💖"
  ];
  ideas.forEach((idea, i) => {
    const p = document.createElement("p");
    p.className = "futuro-item";
    p.style.animationDelay = `${i * 0.6}s`;
    p.innerText = idea;
    futuro.appendChild(p);
  });
}

/* PROMESA */
function mostrarPromesa() {
  escribirTexto(
    promesa,
    "A veces tengo miedo de perderte.\n" +
    "A veces no soy perfecto.\n\n" +
    "Pero prometo luchar por nosotros,\n" +
    "no rendirme y amarte siempre ❤️",
    30
  );
}

/* CARTAS */
const cartas = {
  mes: `Mi amor,<br><br>
  Gracias por este mes contigo.
  No dejemos que las peleas nos ganen jamás.
  Te amo y quiero que seas mi esposa 💍.<br><br>
  Siempre tuyo ❤️`,
  navidad: `Mi niña hermosa,<br><br>
  Esta Navidad quiero agradecer por ti.
  Eres mi regalo más bonito 🎄❤️`
};

function abrirCarta(t) {
  modalCarta.classList.add("abierto");
  textoCarta.innerHTML = cartas[t];
}

function cerrarCarta() {
  modalCarta.classList.remove("abierto");
  textoCarta.innerHTML = "";
}

/* CARRUSEL */
const imgs = document.querySelectorAll(".carousel-img");
let idx = 0;
function mostrar(i) {
  imgs.forEach(img => img.classList.remove("active"));
  imgs[i].classList.add("active");
}
next.onclick = () => mostrar(idx = (idx + 1) % imgs.length);
prev.onclick = () => mostrar(idx = (idx - 1 + imgs.length) % imgs.length);
setInterval(() => mostrar(idx = (idx + 1) % imgs.length), 5000);

/* CORAZONES */
setInterval(() => {
  const c = document.createElement("div");
  c.innerText = "💖";
  c.style.left = Math.random() * 100 + "vw";
  corazones.appendChild(c);
  setTimeout(() => c.remove(), 6000);
}, 500);

/* ESTRELLAS */
const canvas = document.getElementById("estrellas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const stars = Array.from({length:150}, () => ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: Math.random()*1.5
}));
(function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
  });
  requestAnimationFrame(draw);
})();
/* ===== MÚSICA ===== */
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btnMusica");
let musicaActiva = false;

btnMusica.addEventListener("click", () => {
  if (!musicaActiva) {
    musica.volume = 0.35;
    musica.play();
    btnMusica.innerText = "⏸️ Música";
    musicaActiva = true;
  } else {
    musica.pause();
    btnMusica.innerText = "🎶 Música";
    musicaActiva = false;
  }
});

/* Auto-play después de la primera interacción (móvil compatible) */
document.addEventListener("click", () => {
  if (!musicaActiva) {
    musica.volume = 0.25;
    musica.play().catch(() => {});
    musicaActiva = true;
    btnMusica.innerText = "⏸️ Música";
  }
}, { once: true });









