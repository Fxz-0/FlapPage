class LateralBarA extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar" id="sidebar">
        <nav class="sidebar-nav">
            ${this.navItem("Inicio", "/FlapPage/")}
            ${this.navItem("Playlist", "/FlapPage/Playlist/")}
            ${this.navItem("Discord", "https://discord.gg/euf5vbppCC")}
        </nav>
        <div class="social-section">
          <h3 class="section">Redes</h3>
            ${this.redSocial("Instagram", "../img/iconos/Instagram_w.png", "https://www.instagram.com/flapjackdota/")}
            ${this.redSocial("Facebook", "../img/iconos/facebook_w.png", "https://www.facebook.com/FlapjackDotA/")}
            ${this.redSocial("TikTok", "../img/iconos/tik-tok_w.png", "https://www.tiktok.com/@flapjackdota")}
            ${this.redSocial("YouTube", "../img/iconos/Youtube_w.png", "https://www.youtube.com/@FlapjackDota")}
            ${this.redSocial("Kick", "../img/iconos/kick_w.png", "https://kick.com/flapjackdota")}
            ${this.redSocial("Twitch", "../img/iconos/twitch_w.png", "https://www.twitch.tv/flapjackdota")}
            ${this.redSocial("X", "../img/iconos/x_w.png", "https://x.com/flapjackdota")}
        </div>
      </div>
      <button class="close-btn" id="closeSidebar">&times;</button>
    `;

    const sidebar = this.querySelector("#sidebar");
    const overlay = this.querySelector("#sidebarOverlay");
    const closeBtn = this.querySelector("#closeSidebar");

    overlay.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
    closeBtn.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
  }

  closeSidebar(sidebar, overlay) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    const main = document.getElementById("main");
    if (main) main.classList.remove("shifted");
  }

  navItem(nombre, link) {
    return `
      <a href="${link}" class="nav-link">
        <span class="nav-text">${nombre}</span>
      </a>
    `;
  }

  redSocial(nombre, icono, link) {
    return `
      <a href="${link}" target="_blank" class="social-item">
        <div class="social-icon">
          <img src="${icono}" alt="${nombre}" />
        </div>
        <span class="social-text">${nombre}</span>
      </a>
    `;
  }
}

customElements.define("lateralbar-a", LateralBarA);

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const overlay = document.getElementById("sidebarOverlay");

  const isActive = sidebar.classList.contains("active");

  if (isActive) {
    sidebar.classList.remove("active");
    main?.classList.remove("shifted");
    overlay?.classList.remove("active");
  } else {
    sidebar.classList.add("active");
    main?.classList.add("shifted");
    overlay?.classList.add("active");
  }
}


class LateralBarB extends HTMLElement {
  connectedCallback() {
        this.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar" id="sidebar">
        <nav class="sidebar-nav">
            ${this.navItem("Inicio", "/FlapPage/")}
            ${this.navItem("Ruleta", "/FlapPage/Ruleta/")}
            ${this.navItem("Discord", "https://discord.gg/euf5vbppCC")}
        </nav>
        <div class="social-section">
          <h3 class="section">Redes</h3>
            ${this.redSocial("Instagram", "../img/iconos/Instagram_w.png", "https://www.instagram.com/flapjackdota/")}
            ${this.redSocial("Facebook", "../img/iconos/facebook_w.png", "https://www.facebook.com/FlapjackDotA/")}
            ${this.redSocial("TikTok", "../img/iconos/tik-tok_w.png", "https://www.tiktok.com/@flapjackdota")}
            ${this.redSocial("YouTube", "../img/iconos/Youtube_w.png", "https://www.youtube.com/@FlapjackDota")}
            ${this.redSocial("Kick", "../img/iconos/kick_w.png", "https://kick.com/flapjackdota")}
            ${this.redSocial("Twitch", "../img/iconos/twitch_w.png", "https://www.twitch.tv/flapjackdota")}
            ${this.redSocial("X", "../img/iconos/x_w.png", "https://x.com/flapjackdota")}
        </div>
      </div>
      <button class="close-btn" id="closeSidebar">&times;</button>
    `;

    const sidebar = this.querySelector("#sidebar");
    const overlay = this.querySelector("#sidebarOverlay");
    const closeBtn = this.querySelector("#closeSidebar");

    overlay.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
    closeBtn.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
  }

  closeSidebar(sidebar, overlay) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    const main = document.getElementById("main");
    if (main) main.classList.remove("shifted");
  }

  navItem(nombre, link) {
    return `
      <a href="${link}" class="nav-link">
        <span class="nav-text">${nombre}</span>
      </a>
    `;
  }

  redSocial(nombre, icono, link) {
    return `
      <a href="${link}" target="_blank" class="social-item">
        <div class="social-icon">
          <img src="${icono}" alt="${nombre}" />
        </div>
        <span class="social-text">${nombre}</span>
      </a>
    `;
  }
}

customElements.define('lateralbar-b', LateralBarB);

class LateralBarC extends HTMLElement {
  connectedCallback() {
        this.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar" id="sidebar">
        <nav class="sidebar-nav">
            ${this.navItem("Discord", "https://discord.gg/euf5vbppCC")}
        </nav>
        <div class="social-section">
          <h3 class="section">Redes</h3>
            ${this.redSocial("Instagram", "img/iconos/Instagram_w.png", "https://www.instagram.com/flapjackdota/")}
            ${this.redSocial("Facebook", "img/iconos/facebook_w.png", "https://www.facebook.com/FlapjackDotA/")}
            ${this.redSocial("TikTok", "img/iconos/tik-tok_w.png", "https://www.tiktok.com/@flapjackdota")}
            ${this.redSocial("YouTube", "img/iconos/Youtube_w.png", "https://www.youtube.com/@FlapjackDota")}
            ${this.redSocial("Kick", "img/iconos/kick_w.png", "https://kick.com/flapjackdota")}
            ${this.redSocial("Twitch", "img/iconos/twitch_w.png", "https://www.twitch.tv/flapjackdota")}
            ${this.redSocial("X", "img/iconos/x_w.png", "https://x.com/flapjackdota")}
        </div>
      </div>
      <button class="close-btn" id="closeSidebar">&times;</button>
    `;

    const sidebar = this.querySelector("#sidebar");
    const overlay = this.querySelector("#sidebarOverlay");
    const closeBtn = this.querySelector("#closeSidebar");

    overlay.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
    closeBtn.addEventListener("click", () => this.closeSidebar(sidebar, overlay));
  }

  closeSidebar(sidebar, overlay) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    const main = document.getElementById("main");
    if (main) main.classList.remove("shifted");
  }

  navItem(nombre, link) {
    return `
      <a href="${link}" class="nav-link">
        <span class="nav-text">${nombre}</span>
      </a>
    `;
  }

  redSocial(nombre, icono, link) {
    return `
      <a href="${link}" target="_blank" class="social-item">
        <div class="social-icon">
          <img src="${icono}" alt="${nombre}" />
        </div>
        <span class="social-text">${nombre}</span>
      </a>
    `;
  }
}
customElements.define('lateralbar-c', LateralBarC);

class LateralBarD extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar" id="sidebar">
        <a href="/FlapPage/" class="nav-link">Inicio</a>
        <a href="/FlapPage/Playlist/" class="nav-link">Playlist</a>
        <a href="https://discord.gg/euf5vbppCC" class="nav-link">Discord</a>

        <div class="social-section">
          <h3 class="section">Redes</h3>
          ${this.redSocial("Instagram", "../img/iconos/Instagram_w.png", "https://www.instagram.com/flapjackdota/")}
          ${this.redSocial("Facebook", "../img/iconos/facebook_w.png", "https://www.facebook.com/FlapjackDotA/")}
          ${this.redSocial("TikTok", "../img/iconos/tik-tok_w.png", "https://www.tiktok.com/@flapjackdota")}
          ${this.redSocial("YouTube", "../img/iconos/Youtube_w.png", "https://www.youtube.com/@FlapjackDota")}
          ${this.redSocial("Kick", "../img/iconos/kick_w.png", "https://kick.com/flapjackdota")}
          ${this.redSocial("Twitch", "../img/iconos/twitch_w.png", "https://www.twitch.tv/flapjackdota")}
          ${this.redSocial("X", "../img/iconos/x_w.png", "https://x.com/flapjackdota")}
        </div>
      </div>
    `;
  }
  redSocial(nombre, icono, link) {
      return `
        <a href="${link}" target="_blank">
          <div class="social-item">
            <div class="social-icon"><img src="${icono}" alt="${nombre}" class="social-icon"></div>
            <h3 class="social-text">${nombre}</h3>
          </div>
        </a>
      `;
    }
  }
customElements.define('lateralbar-d', LateralBarD);
// --------------------------------------------------
class RouletteComponent extends HTMLElement {
  constructor() {
      super();
  }

  connectedCallback() {
      this.innerHTML = `
          <div class="roulette-container">
              <div id="canvasContainer" onclick="wheelObject.startAnimation(); document.getElementById('spinButton').disabled = true;">
                  <canvas id='Ruleta' width='700' height='700'>   
                      Canvas not supported, use another browser.
                  </canvas>  
              </div>
              <div class="button-container">

              </div>
          </div>
      `;
  }
}

class OptionsList extends HTMLElement {
  constructor() {
      super();
  }

  connectedCallback() {
  this.innerHTML = `
    <div class="options-card">
      <div class="card bg-warning">
        <div class="card-body">
            <h4 class="card-title">Lista de elementos:</h4>  
            <textarea id="ListaElementos" class="form-control" rows="13">
1 sol
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
BAN (1 dia)
            </textarea>
            <br />
            <div class="button-group">
              <input type="button" onclick="mezclarElementos()" class="btn btn-danger btn-lg btn-block" value="Mezclar" />
              <input id="spinButton" class="btn-block btn-lg btn btn-success" onclick="wheelObject.startAnimation(); this.disabled=true;" value="Girar" type="button"/>
            </div>
            <div class="special-buttons">
              <img src="../img/OgreMagi.webp" alt="Button 1" class="img-button" onclick="BaraOpcions()" style="cursor: pointer; width: 80px; margin: 20px 0px 10px 0px;">
              <img src="../img/BarathrumSquare.webp" alt="Button 2" class="img-button" onclick="MulticastOpcion()" style="cursor: pointer; width: 80px; margin:20px 10px 10px 10px;">
              <img src="../img/image_2025-04-09_191452607.webp" alt="Button 3" class="img-button" onclick="RulettesubsOpcion()" style="cursor: pointer; width: 80px; margin:20px 0px 10px 0px;">
            </div>
        </div>
      </div>
    </div>
  `;
  }
}

class ResultsList extends HTMLElement {
  constructor() {
      super();
  }

  connectedCallback() {
      this.innerHTML = `
          <div class="results-card">
              <div class="card">
                  <div class="card-body">
                      <h4 class="card-title" id="h4-Area">Premios Ganados:</h4>
                      <div id="premiosGanados" class="premios-list">
                          <!-- Aquí se mostrarán los premios ganados -->
                          <p>No hay premios ganados aún</p>
                      </div>
                  </div>
              </div>
          </div>
      `;
  }
}

customElements.define('roulette-component', RouletteComponent);
customElements.define('options-list', OptionsList);
customElements.define('results-list', ResultsList);

// --------------------------------------------------
class PortadaComponent extends HTMLElement {
  constructor() {
      super();
  }

  connectedCallback() {
      this.innerHTML = `
      <div class="container">
        <div class="layers-container" id="container">
          <div class="layer layer-4">
              <div class="_3oI3Cee_b2-8YjgBOC_Tc2 spirit_breaker">
                  <video class="_22nJ5nsfHDS2jEscPEne0-" poster="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/spirit_breaker.png" autoplay="" preload="auto" loop="" playsinline=""  style="height: 350px; margin-left: -45px;">
                      <source type="video/mp4; codecs=&quot;hvc1&quot;" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/spirit_breaker.mov">
                      <source type="video/webm" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/spirit_breaker.webm?undefined">
                      <img src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/spirit_breaker.png">
                  </video>
              </div>
              <div class="_3oI3Cee_b2-8YjgBOC_Tc2 wisp">
                  <video class="_22nJ5nsfHDS2jEscPEne0-" poster="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/wisp.png" autoplay="" preload="auto" loop="" playsinline=""  style="height: 500px; transform: scaleX(-1); margin-left: 450px; margin-top: -50px;">
                      <source type="video/mp4; codecs=&quot;hvc1&quot;" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/wisp.mov">
                      <source type="video/webm" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/wisp.webm?undefined">
                      <img src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/wisp.png">
                  </video>
              </div>
          </div>

          <div class="layer layer-3">
              <div class="_3oI3Cee_b2-8YjgBOC_Tc2 phoenix">
                  <video class="_22nJ5nsfHDS2jEscPEne0-" poster="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/phoenix.png" autoplay="" preload="auto" loop="" playsinline=""  style="height: 650px; margin: -100px;">
                      <source type="video/mp4; codecs=&quot;hvc1&quot;" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/phoenix.mov">
                      <source type="video/webm" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/phoenix.webm?undefined">
                      <img src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/phoenix.png">
                  </video>
              </div>
              <div class="_3oI3Cee_b2-8YjgBOC_Tc2 techies">
                  <video class="_22nJ5nsfHDS2jEscPEne0-" poster="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/techies.png" autoplay="" preload="auto" loop="" playsinline=""  style="height: 430px;  margin-left: -200px;  transform: scaleX(-1);" >
                      <source type="video/mp4; codecs=&quot;hvc1&quot;" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/techies.mov">
                      <source type="video/webm" src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/techies.webm?undefined">
                      <img src="https://cdn.akamai.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/techies.png">
                  </video>
              </div>
          </div>

          <div class="layer layer-2">
              <img src="img/flap2024.webp" alt="FlapJack" class="profile-pic" >
          </div>
          
          <div class="layer layer-1">
                  <h1>the FLAPJACK'S Carnival</h1>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('portada-component', PortadaComponent);
document.addEventListener("DOMContentLoaded", function () {
  const videos = document.querySelectorAll("portada-component video");
  videos.forEach(video => {
    video.muted = true; // Asegúrate de que esté silenciado
    video.play().catch(error => {
        console.error("El video no pudo reproducirse automáticamente:", error);
    });
  });
});
