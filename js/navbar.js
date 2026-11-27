/* Efeitos e navegação compartilhados pelo site. */

(function () {

    "use strict";

    const consultaMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    function menosMovimento() {
        return consultaMovimento.matches;
    }


    // Reinicia uma animação aplicada por classe.

    const temporizadores = new WeakMap();

    function reiniciarAnimacao(elemento, classe, duracao = 600) {

        if (!elemento) return;

        let mapa = temporizadores.get(elemento);

        if (!mapa) {
            mapa = {};
            temporizadores.set(elemento, mapa);
        }

        clearTimeout(mapa[classe]);

        elemento.classList.remove(classe);

        // Recalcula o layout para reiniciar a animação.
        void elemento.offsetWidth;

        if (menosMovimento()) return;

        elemento.classList.add(classe);

        mapa[classe] = setTimeout(() => {
            elemento.classList.remove(classe);
        }, duracao);
    }


    // Efeitos de partículas.

    const PALETAS = {
        padrao:   ["#ffd500", "#ffffff", "#e00000", "#15c20f"],
        cogumelo: ["#e00000", "#ffffff", "#ff6b6b"],
        flor:     ["#ff7a00", "#e00000", "#ffd500"],
        estrela:  ["#ffd500", "#ffffff", "#fff3a0"],
        moeda:    ["#ffd500", "#ffb800", "#ffffff"],
        poeira:   ["#ffffff", "#cfd8e8", "#9fb4d8"]
    };

    const LIMITE_PARTICULAS = 90;

    let camadaFx = null;

    function obterCamada() {

        if (camadaFx && camadaFx.isConnected) return camadaFx;

        camadaFx = document.createElement("div");
        camadaFx.className = "fx-camada";
        camadaFx.setAttribute("aria-hidden", "true");

        document.body.appendChild(camadaFx);

        return camadaFx;
    }

    function particulas(x, y, opcoes = {}) {

        if (menosMovimento() || typeof Element.prototype.animate !== "function") return;

        const {
            paleta = "padrao",
            quantidade = 10,
            distancia = 90,
            tamanho = 9,
            estrela = false,
            gravidade = 40,
            abertura = 1.4
        } = opcoes;

        const camada = obterCamada();
        const cores = PALETAS[paleta] || PALETAS.padrao;

        // Reduz a quantidade de partículas em telas pequenas.
        const total = window.innerWidth < 600
            ? Math.ceil(quantidade * 0.6)
            : quantidade;

        for (let i = 0; i < total; i++) {

            if (camada.childElementCount >= LIMITE_PARTICULAS) return;

            const lado = tamanho * (0.7 + Math.random() * 0.7);

            const particula = document.createElement("span");

            particula.className = estrela
                ? "fx-particula fx-estrela"
                : "fx-particula";

            particula.style.left = x + "px";
            particula.style.top = y + "px";
            particula.style.width = lado + "px";
            particula.style.height = lado + "px";
            particula.style.background =
                cores[Math.floor(Math.random() * cores.length)];

            camada.appendChild(particula);

            // Leque voltado para cima
            const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * abertura;
            const alcance = distancia * (0.5 + Math.random() * 0.7);

            const dx = Math.cos(angulo) * alcance;
            const dy = Math.sin(angulo) * alcance;
            const giro = (Math.random() - 0.5) * 360;

            const animacao = particula.animate([
                {
                    transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${giro}deg)`,
                    opacity: 1,
                    offset: 0.6
                },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + gravidade}px)) scale(0.2) rotate(${giro * 1.5}deg)`,
                    opacity: 0
                }
            ], {
                duration: 600 + Math.random() * 300,
                easing: "cubic-bezier(.2, .8, .3, 1)",
                fill: "forwards"
            });

            animacao.onfinish = () => particula.remove();
        }
    }


    // Animação da moeda.

    function moeda(x, y) {

        if (menosMovimento() || typeof Element.prototype.animate !== "function") return;

        const camada = obterCamada();

        const imagem = document.createElement("img");

        imagem.className = "fx-moeda";
        imagem.src = "images/moeda.png";
        imagem.alt = "";

        imagem.style.left = x + "px";
        imagem.style.top = y + "px";

        imagem.onerror = () => imagem.remove();

        camada.appendChild(imagem);

        const animacao = imagem.animate([
            {
                transform: "translate(-50%, -50%) rotateY(0deg)",
                opacity: 1,
                easing: "cubic-bezier(.2, .7, .4, 1)"
            },
            {
                transform: "translate(-50%, calc(-50% - 105px)) rotateY(540deg)",
                opacity: 1,
                offset: 0.5,
                easing: "cubic-bezier(.5, 0, .9, .6)"
            },
            {
                transform: "translate(-50%, calc(-50% - 30px)) rotateY(1080deg)",
                opacity: 0
            }
        ], {
            duration: 850,
            fill: "forwards"
        });

        animacao.onfinish = () => imagem.remove();
    }

    window.MarioFX = {
        menosMovimento,
        reiniciarAnimacao,
        particulas,
        moeda
    };


    /* =============================================
       NAVBAR
    ============================================= */

    // Trata "/" e "index.html" como a página inicial.
    function normalizar(caminho) {
        return caminho.replace(/index\.html$/, "");
    }

    function mesmaPagina(url) {
        return url.origin === location.origin
            && normalizar(url.pathname) === normalizar(location.pathname);
    }

    // Reforça a sombra ao rolar a página.
    function configurarSombraDaNavbar() {

        const navbar = document.querySelector(".navbar");

        if (!navbar) return;

        let pendente = false;

        function atualizar() {
            pendente = false;
            navbar.classList.toggle("navbar-rolando", window.scrollY > 8);
        }

        window.addEventListener("scroll", () => {
            if (pendente) return;
            pendente = true;
            requestAnimationFrame(atualizar);
        }, { passive: true });

        atualizar();
    }

    // Destaca o link da página atual.
    function marcarLinkDaPagina() {

        document.querySelectorAll(".navbar-links .nav-link").forEach(link => {

            const url = new URL(link.href, location.href);

            if (!url.hash && mesmaPagina(url)) {
                link.classList.add("ativo");
                link.setAttribute("aria-current", "page");
            }

        });
    }

    // Destaca a seção visível no menu.
    function iniciarScrollspy() {

        if (!("IntersectionObserver" in window)) return;

        const mapa = {};

        document.querySelectorAll(".navbar-links .nav-link").forEach(link => {

            const url = new URL(link.href, location.href);

            if (url.hash && mesmaPagina(url)) {
                mapa[url.hash.slice(1)] = link;
            }

        });

        const secoes = Array.from(document.querySelectorAll("main section[id]"));

        if (!Object.keys(mapa).length || !secoes.length) return;

        function destacar(id) {

            Object.keys(mapa).forEach(chave => {

                const ativo = chave === id;

                mapa[chave].classList.toggle("ativo", ativo);

                if (ativo) {
                    mapa[chave].setAttribute("aria-current", "location");
                } else {
                    mapa[chave].removeAttribute("aria-current");
                }

            });
        }

        // A faixa central indica a seção atual.
        const observador = new IntersectionObserver((entradas) => {

            entradas.forEach(entrada => {
                if (entrada.isIntersecting) destacar(entrada.target.id);
            });

        }, { rootMargin: "-45% 0px -50% 0px" });

        secoes.forEach(secao => observador.observe(secao));
    }

    // Controla a abertura do menu de perfil.
    function configurarDropdown() {

        const dropdown = document.querySelector(".perfil-dropdown");

        if (!dropdown) return;

        const botao = dropdown.querySelector("summary");

        function fechar() {

            if (!dropdown.open || dropdown.classList.contains("fechando")) return;

            if (menosMovimento()) {
                dropdown.open = false;
                return;
            }

            dropdown.classList.add("fechando");

            setTimeout(() => {
                dropdown.open = false;
                dropdown.classList.remove("fechando");
            }, 160);
        }

        // Fecha o menu ao clicar novamente.
        botao.addEventListener("click", (evento) => {

            if (dropdown.open) {
                evento.preventDefault();
                fechar();
            }

        });

        // Fecha o menu ao clicar fora.
        document.addEventListener("click", (evento) => {
            if (!dropdown.contains(evento.target)) fechar();
        });

        // Fecha com Esc e devolve o foco ao botão.
        document.addEventListener("keydown", (evento) => {

            if (evento.key === "Escape" && dropdown.open) {
                fechar();
                botao.focus();
            }

        });
    }


    // Transição circular antes de abrir outra página.

    let navegando = false;

    function transicaoDePagina(destino, x, y) {

        if (navegando) return;

        navegando = true;

        const largura = window.innerWidth;
        const altura = window.innerHeight;

        const raio = Math.hypot(
            Math.max(x, largura - x),
            Math.max(y, altura - y)
        );

        const base = 40;
        const escala = (raio / (base / 2)) * 1.08 + 1;

        const camada = document.createElement("div");
        camada.className = "fx-warp-camada";
        camada.setAttribute("aria-hidden", "true");

        const amarelo = document.createElement("span");
        amarelo.className = "fx-warp";

        const azul = document.createElement("span");
        azul.className = "fx-warp fx-warp-azul";

        [amarelo, azul].forEach(circulo => {
            circulo.style.left = (x - base / 2) + "px";
            circulo.style.top = (y - base / 2) + "px";
            camada.appendChild(circulo);
        });

        document.body.appendChild(camada);

        const opcoes = {
            duration: 460,
            easing: "cubic-bezier(.7, 0, .3, 1)",
            fill: "forwards"
        };

        const quadros = [
            { transform: "scale(0)" },
            { transform: `scale(${escala})` }
        ];

        amarelo.animate(quadros, opcoes);
        azul.animate(quadros, { ...opcoes, delay: 120 });

        setTimeout(() => {
            window.location.href = destino;
        }, 640);
    }

    function configurarTransicaoDePagina() {

        document.addEventListener("click", (evento) => {

            if (evento.defaultPrevented || evento.button !== 0) return;
            if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;

            const link = evento.target.closest("a[href]");

            if (!link) return;
            if (link.target === "_blank" || link.hasAttribute("download")) return;
            if (link.hasAttribute("data-sem-transicao")) return;

            let url;

            try {
                url = new URL(link.href, location.href);
            } catch (erro) {
                return;
            }

            if (!/^(https?|file):$/.test(url.protocol)) return;
            if (url.origin !== location.origin) return;

            // Mantém a rolagem suave nos links da mesma página.
            if (mesmaPagina(url)) return;

            if (menosMovimento()) return;

            evento.preventDefault();

            let x = evento.clientX;
            let y = evento.clientY;

            // O teclado não fornece coordenadas do mouse.
            if (evento.detail === 0) {
                const caixa = link.getBoundingClientRect();
                x = caixa.left + caixa.width / 2;
                y = caixa.top + caixa.height / 2;
            }

            transicaoDePagina(url.href, x, y);
        });

        // Limpa a transição ao voltar pelo histórico.
        window.addEventListener("pageshow", (evento) => {

            if (!evento.persisted) return;

            navegando = false;

            document.querySelectorAll(".fx-warp-camada")
                .forEach(camada => camada.remove());
        });
    }


    function iniciar() {
        configurarSombraDaNavbar();
        marcarLinkDaPagina();
        configurarDropdown();
        configurarTransicaoDePagina();
    }

    window.MarioNav = {
        iniciarScrollspy
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
