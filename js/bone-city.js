function Calcular() {
    const sub = 0.85;
    const nosub = 0.80;

    const input = document.getElementById('puntos');
    const resultado = document.getElementById('resultado');

    const valor = input.value.trim();

    if (valor === '') {
        resultado.innerHTML = '';
        return;
    }

    const puntos = Number(valor);

    if (!Number.isFinite(puntos)) {
        resultado.innerHTML = '<br><p>Ingresa un número válido.</p>';
        return;
    }

    if (puntos < 0) {
        resultado.innerHTML = '<br><p>Los puntos no pueden ser negativos.</p>';
        return;
    }

    const tsub = (puntos / 100) * sub;
    const tnosub = (puntos / 100) * nosub;

    resultado.innerHTML = `
        <div class="patch-article-table">
            <table class="patch-tb">
                <thead>
                    <tr class="patch-tb-f">
                        <th scope="col">Retiro Con Sub</th>
                        <th scope="col">Retiro Sin Sub</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="patch-tb-f">
                        <td>S/. ${tsub.toFixed(2)}</td>
                        <td>S/. ${tnosub.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

document.getElementById('puntos').addEventListener('input', Calcular);