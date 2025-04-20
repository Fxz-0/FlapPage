class LateralBarA extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="sidebar" id="sidebar">
            <a href="/FlapPage/" class="nav-link">Inicio</a>
            <a href="/FlapPage/Ruleta" class="nav-link">Ruleta</a>
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
    
customElements.define('lateralbar-a', LateralBarA);

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");

  sidebar.classList.toggle("active");
  main.classList.toggle("shifted");
}

class LateralBarB extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar" id="sidebar">
        <a href="/FlapPage/" class="nav-link">Inicio</a>
        <a href="/FlapPage/Playlist/" class="nav-link">Playlist</a>
        <a href="https://discord.gg/euf5vbppCC" class="nav-link">Discord</a>

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

customElements.define('lateralbar-b', LateralBarB);

class LateralBarC extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="sidebar" id="sidebar">
        <a href="/FlapPage/" class="nav-link">Inicio</a>
        <a href="/FlapPage/Ruleta" class="nav-link">Ruleta</a>
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
  customElements.define('lateralbar-c', LateralBarC);

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
Opcion 1
Opcion 2
Opcion 3
Opcion 4
Opcion 5
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