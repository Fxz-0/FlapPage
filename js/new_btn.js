
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
        for (let i = Elementos.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
        }
        $('#ListaElementos').val(Elementos.join('\n'));
        leerElementos();
    }

function RulettesubsOpcion() {
        const options3 =
`1 sol
1 sol
1 sol
1 sol
1 sol
1 sol
1 sol
1 sol
2 soles
2 soles
2 soles
2 soles
2 soles
2 soles
2 soles
2 soles
1000 puntos
1000 puntos
1000 puntos
1000 puntos
1000 puntos
1000 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
1500 puntos
2000 puntos
2000 puntos
2000 puntos
2000 puntos
2000 puntos
2000 puntos
4000 puntos
4000 puntos
desayuno en Tambo
desayuno en Tambo
desayuno en Tambo
5 soles
5 soles
5 soles
5 soles
5 soles
5 soles
tu menú
tu menú 
10 soles
10 soles
10 soles
10 soles
entrada Valetodo
balde de KFC
50 soles
50 soles
50 soles
100 soles
100 soles
BAN (1 dia)`;
        document.getElementById('ListaElementos').value = options3;
                for (let i = Elementos.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [Elementos[i], Elementos[j]] = [Elementos[j], Elementos[i]];
        }
        $('#ListaElementos').val(Elementos.join('\n'));
        leerElementos();
    }
