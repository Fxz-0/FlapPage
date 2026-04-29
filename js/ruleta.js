// Ruleta.js
let wheelObject;
let winningSegment;
let distanceX = 150;
let distanceY = 50;
let ctx;
let audioTick = new Audio('../img/recursos/efectorl.mp3');
let audioWin = new Audio('../img/efect.mp3');
let previousSegmentIndex = null;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        leerElementos();
    }, 100);
});

function Mensaje() {
    winningSegment = wheelObject.getIndicatedSegment();
    SonidoFinal();
    
    swal({
        title: " ¡ " + winningSegment.text + " !",
        text: "GANASTE",
        imageUrl: "../img/rat-rainbow.gif",
        showCancelButton: true,
        confirmButtonColor: "#6f1acf",
        confirmButtonText: "Aceptar",
        cancelButtonText: "Quitar Opcion",
        closeOnConfirm: true,
        closeOnCancel: true
    },
    function(isConfirm) {
        if (isConfirm) {
            //agregarPremioGanado(winningSegment.text);
        } else {
            $('#ListaElementos').val($('#ListaElementos').val().replace(winningSegment.text, ""));
            leerElementos();
        }
        wheelObject.stopAnimation(false);
        wheelObject.rotationAngle = 0;
        wheelObject.draw();
        DibujarTriangulo();
        document.getElementById('spinButton').disabled = false;
    });
}

function agregarPremioGanado(premio) {
    const premiosList = document.getElementById('premiosGanados');

    if (premiosList.querySelector('p')) {
        premiosList.innerHTML = '';
    }

    const premioItem = document.createElement('div');
    premioItem.classList.add('premio-item');
    premioItem.innerHTML = `
        <span class="premio-texto">${premio}</span>
    `;
//<span class="premio-fecha">${new Date().toLocaleString()}</-span>
    premiosList.appendChild(premioItem);
}

function DibujarTriangulo() {
    distanceX = 152;
    distanceY = 10;
    ctx = wheelObject.ctx;
    ctx.strokeStyle = '#fffedf';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(distanceX + 170, distanceY + 5);
    ctx.lineTo(distanceX + 230, distanceY + 5);
    ctx.lineTo(distanceX + 200, distanceY + 50);
    ctx.lineTo(distanceX + 171, distanceY + 5);
    ctx.stroke();
    ctx.fill();
}

function SonidoTick() {
    let currentSegmentIndex = wheelObject.getIndicatedSegmentNumber();
    if (previousSegmentIndex !== currentSegmentIndex) {
        audioTick.pause();
        audioTick.currentTime = 0;
        audioTick.play();
        previousSegmentIndex = currentSegmentIndex;
    }
}

function SonidoFinal() {
    audioWin.pause();
    audioWin.currentTime = 0;
    audioWin.play();
    audioWin.volume = 0.25;
}

function AnimacionLoop() {
    DibujarTriangulo();
    SonidoTick();
}

function DibujarRuleta(ArregloElementos) {
    wheelObject = new Winwheel({
        'canvasId': 'Ruleta',
        'numSegments': ArregloElementos.length,
        'outerRadius': 330,
        'innerRadius': 1,
        'lineWidth': 2,
        'strokeStyle': '#fffedf',
        'segments': ArregloElementos,
        'textMargin': 25,
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 10,
            'callbackFinished': 'Mensaje()',
            'callbackAfter': 'AnimacionLoop()',
            'easing': 'Power3.easeOut'
        },
    });

    DibujarTriangulo();
}

function leerElementos() {
    let txtListaElementos = $('#ListaElementos').val().trim();
    let Elementos = txtListaElementos.split('\n');
    let ElementosRuleta = [];
    let colores = ['#fd7eff', '#7ee2ff', '#7effa5', '#f5ff7e', '#ffc46a'];
    
    Elementos.forEach(function(Elemento, index) {
        if (Elemento) {
            ElementosRuleta.push({ 'fillStyle': colores[index % colores.length], 'text': Elemento });
        }
    });
    
    DibujarRuleta(ElementosRuleta);
}

function mezclarElementos() {
    let txtListaElementos = $('#ListaElementos').val().trim();
    let Elementos = txtListaElementos.split('\n');
    
    for (let i = Elementos.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
    }
    
    $('#ListaElementos').val(Elementos.join('\n'));
    leerElementos();
}

function BaraOpcions() {
    const options1 = 
`No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
Gana x2 (4000)  
No pasa nada
Gana x3 (6000)  
Gana x5 (10,000)  
No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
Gana x2 (4000)  
Gana x3 (6000)  
No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
No pasa nada
Gana x5 (10,000)  
No pasa nada
Gana x1.5 (3000)  
No pasa nada
Gana x1.5 (3000)  
Gana x2 (4000)  
No pasa nada
No pasa nada
No pasa nada
Gana x3 (6000)  
No pasa nada
No pasa nada
No pasa nada
Gana x1.5 (3000)  
Gana x2 (4000)  
No pasa nada
No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
No pasa nada
Gana x5 (10,000)  
No pasa nada
Gana x1.5 (3000)  
No pasa nada
Gana x1.5 (3000)  
Gana x2 (4000)  
No pasa nada
No pasa nada
No pasa nada
Gana x3 (6000)  
Gana x2 (4000)  
No pasa nada
No pasa nada
No pasa nada
Gana x1.5 (3000)  
Gana x2 (4000)  
No pasa nada
Gana x3 (6000)  
No pasa nada
No pasa nada
No pasa nada
Gana x5 (10,000)  
Gana x1.5 (3000)  
No pasa nada
Gana x1.5 (3000)
Gana x1.5 (3000)  
No pasa nada
No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
Gana x2 (4000)  
No pasa nada
No pasa nada
Gana x3 (6000)  
No pasa nada
No pasa nada
No pasa nada
Gana x2 (4000)  
No pasa nada
No pasa nada
Gana x1.5 (3000)  
No pasa nada
No pasa nada
Gana x5 (10,000)
No pasa nada
Gana x1.5 (3000)
No pasa nada
Gana x3 (6000)
No pasa nada
No pasa nada
Gana x1.5 (3000)
No pasa nada
Gana x2 (4000)
No pasa nada
Gana x1.5 (3000)
No pasa nada
Gana x3 (6000)
Gana x2 (4000)
No pasa nada
No pasa nada`;
    document.getElementById('ListaElementos').value = options1;
    let txtListaElementos = $('#ListaElementos').val().trim();
    let Elementos = txtListaElementos.split('\n');
    
    for (let i = Elementos.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
    }
    $('#ListaElementos').val(Elementos.join('\n'));

    leerElementos();
}

function MulticastOpcion() {
    const options2 = 
`NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
NO BASHEASTE
BASH`;
    document.getElementById('ListaElementos').value = options2;
    let txtListaElementos = $('#ListaElementos').val().trim();
    let Elementos = txtListaElementos.split('\n');
    
    for (let i = Elementos.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
    }
    $('#ListaElementos').val(Elementos.join('\n'));

    leerElementos();
}

function RulettesubsOpcion() {
    const options3 =
`nada
nada
nada
nada
1 Bola de pelo de mi gato
nada
nada
nada
nada
10 centimos
1 millon de soles
nada
nada
nada
nada
nada
nada
nada
nada
nada
nada
1 foto de Tao calato
nada
nada
nada
1 terreno en Miami
nada
nada
nada
1 BMW z8 2026 0km
nada
nada
nada
nada
nada
nada
nada
nada
nada`;
    document.getElementById('ListaElementos').value = options3;
    let txtListaElementos = $('#ListaElementos').val().trim();
    let Elementos = txtListaElementos.split('\n');
    
    for (let i = Elementos.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
    }
    $('#ListaElementos').val(Elementos.join('\n'));
    leerElementos();
}

async function tickets_carmesi() {
  const listaElementos = document.getElementById('ListaElementos');
  listaElementos.value = "Cargando participantes...";

  try {
    // 📦 Cargar JSON desde /js/
    const response = await fetch("../js/participantes.json");
    const participantes = await response.json();

    // 🔁 Generar lista de nombres repetidos según los tickets
    const elementos = [];
    participantes.forEach(p => {
      for (let i = 0; i < p.tickets; i++) {
        elementos.push(p.nombre);
      }
    });

    // 🧠 Mezclar aleatoriamente (Fisher-Yates)
    for (let i = elementos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elementos[i], elementos[j]] = [elementos[j], elementos[i]];
    }

    // ✍️ Colocar en el textarea
    listaElementos.value = elementos.join('\n');

    // 🔥 Ejecutar tu función leerElementos() si existe
    if (typeof leerElementos === "function") {
      leerElementos();
    }

  } catch (error) {
    console.error("Error cargando o procesando participantes.json:", error);
    listaElementos.value = "⚠️ Error al cargar /js/participantes.json";
  }
}
