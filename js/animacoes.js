(function () {
    "use strict";

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduzido) {
        document.documentElement.classList.add("animacoes-ativas");

        document.addEventListener("DOMContentLoaded", () => {
            const elementos = document.querySelectorAll("main section, .produto-card, .bloco-card, .auth-card");

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
            const alvo = evento.target.closest(".produto-card, .bloco-card, .auth-card");
            if (!alvo) return;
            const ret = alvo.getBoundingClientRect();
            alvo.style.setProperty("--mouse-x", `${evento.clientX - ret.left}px`);
            alvo.style.setProperty("--mouse-y", `${evento.clientY - ret.top}px`);
        });
    }
})();
