(function () {
    "use strict";

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Barra de progresso da rolagem.
    const barra = document.createElement("div");
    barra.className = "progresso-rolagem";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    let quadro = 0;
    function atualizarBarra() {
        quadro = 0;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        barra.style.transform = "scaleX(" + (total > 0 ? Math.min(window.scrollY / total, 1) : 0) + ")";
    }
    window.addEventListener("scroll", () => { if (!quadro) quadro = requestAnimationFrame(atualizarBarra); }, { passive: true });
    window.addEventListener("resize", atualizarBarra);
    atualizarBarra();

    if (!reduzido) {
        document.documentElement.classList.add("animacoes-ativas");

        document.addEventListener("DOMContentLoaded", () => {
            const elementos = document.querySelectorAll("main section, .produto-card, .bloco-card, .auth-card, .compra-card");

            if ("IntersectionObserver" in window) {
                const observer = new IntersectionObserver((entradas) => {
                    entradas.forEach((entrada) => {
                        if (!entrada.isIntersecting) return;
                        entrada.target.classList.add("revelado");
                        observer.unobserve(entrada.target);
                    });
                }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

                elementos.forEach((elemento, indice) => {
                    elemento.classList.add("entrada-reveal");
                    elemento.style.setProperty("--atraso-reveal", `${Math.min(indice % 8, 7) * 55}ms`);
                    observer.observe(elemento);
                });
            } else {
                elementos.forEach((elemento) => elemento.classList.add("revelado"));
            }
        });

        document.addEventListener("pointermove", (evento) => {
            const alvo = evento.target.closest(".produto-card, .bloco-card, .auth-card, .compra-card");
            if (!alvo) return;
            const ret = alvo.getBoundingClientRect();
            alvo.style.setProperty("--mouse-x", `${evento.clientX - ret.left}px`);
            alvo.style.setProperty("--mouse-y", `${evento.clientY - ret.top}px`);
        });
    }
})();
