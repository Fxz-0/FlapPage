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
          ${this.redSocial("Instagram", "/FlapPage/img/iconos/Instagram_w.png", "https://www.instagram.com/flapjackdota/")}
          ${this.redSocial("Facebook", "/FlapPage/img/iconos/facebook_w.png", "https://www.facebook.com/FlapjackDotA/")}
          ${this.redSocial("TikTok", "/FlapPage/img/iconos/tik-tok_w.png", "https://www.tiktok.com/@flapjackdota")}
          ${this.redSocial("YouTube", "/FlapPage/img/iconos/Youtube_w.png", "https://www.youtube.com/@FlapjackDota")}
          ${this.redSocial("Kick", "/FlapPage/img/iconos/kick_w.png", "https://kick.com/flapjackdota")}
          ${this.redSocial("Twitch", "/img/iconos/twitch_w.png", "https://www.twitch.tv/flapjackdota")}
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
