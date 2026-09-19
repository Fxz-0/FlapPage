const API_URL = "https://script.google.com/macros/s/AKfycbyUpp60xm4ywKHUedtWdszTAcgxvk5Nm57k3giiteo4vPbwTbBlXerg4yAS13mKM1n9/exec";

async function tb_Participantes() {
  try {
    const response = await fetch(API_URL);
    const participantes = await response.json();

    const tbody = document.getElementById("cuerpo");
    tbody.innerHTML = participantes.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.tickets}</td>
        <td>${p.steamId}</td>
        <td>${p.verified ? "✅" : "❌" }</td>
        <td>${p.comment || "-"}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error:", error);
  }
}

tb_Participantes();

  