function Calcular() {
    var puntos;
    var sub = 0.85;
    var nosub = 0.8;
    var sub, nosub, tsub, tnosub;

    const input = document.getElementById('puntos');
    const resultado = document.getElementById('resultado');

    if (input.value.trim() === '') {
        resultado.innerHTML = '<br><p>Ingresa una cantidad de puntos.</p>';
        input.focus();
        return;
    }

    puntos = Number(input.value);

    if (!Number.isFinite(puntos)) {
        resultado.innerHTML = '<br><p>Ingresa un número válido.</p>';
        input.focus();
        return;
    }

    if (puntos < 0) {
        resultado.innerHTML = '<br><p>Los puntos no pueden ser negativos.</p>';
        input.focus();
        return;
    }

    tsub = (puntos / 100) * sub;
    tnosub = (puntos / 100) * nosub;

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