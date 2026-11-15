/* =================================================
   PÁGINA DE PERFIL — apenas visual (sem banco de dados)

   Nada é enviado nem salvo: os formulários só validam
   os campos e mostram um aviso de simulação.
   Usa window.MarioFX (js/navbar.js) para os efeitos.
================================================= */

(function () {

    "use strict";

    const toast = document.getElementById("auth-toast");
    let tempoToast = null;


    /* =============================================
       AVISO (TOAST)
    ============================================= */

    function mostrarAviso(texto) {

        toast.textContent = texto;
        toast.classList.add("visivel");

        clearTimeout(tempoToast);

        tempoToast = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 3500);
    }


    /* =============================================
       VALIDAÇÃO VISUAL
    ============================================= */

    const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function erroDoCampo(campo, mensagem) {

        const caixa = campo.closest(".campo");
        const aviso = caixa.querySelector(".campo-erro");

        caixa.classList.remove("invalido");
        void caixa.offsetWidth;                // reinicia a animação

        if (mensagem) caixa.classList.add("invalido");

        aviso.textContent = mensagem || "";

        return !mensagem;
    }

    function limparErro(campo) {

        const caixa = campo.closest(".campo");

        if (!caixa) return;

        caixa.classList.remove("invalido");
        caixa.querySelector(".campo-erro").textContent = "";
    }

    // Ao digitar, o erro daquele campo some
    document.querySelectorAll(".campo input").forEach(campo => {
        campo.addEventListener("input", () => limparErro(campo));
    });


    function validarEmail(campo) {

        const valor = campo.value.trim();

        if (!valor) return erroDoCampo(campo, "Digite seu e-mail.");
        if (!EMAIL_VALIDO.test(valor)) return erroDoCampo(campo, "E-mail inválido.");

        return erroDoCampo(campo, "");
    }

    function validarSenha(campo, minimo) {

        if (!campo.value) return erroDoCampo(campo, "Digite sua senha.");

        if (minimo && campo.value.length < minimo) {
            return erroDoCampo(campo, "Use ao menos " + minimo + " caracteres.");
        }

        return erroDoCampo(campo, "");
    }


    /* =============================================
       EFEITO DE SUCESSO (moedas e estrelas)
    ============================================= */

    function festa(botao) {

        if (!window.MarioFX) return;

        const caixa = botao.getBoundingClientRect();
        const x = caixa.left + caixa.width / 2;
        const y = caixa.top;

        window.MarioFX.moeda(x, y);
        window.MarioFX.particulas(x, y, { paleta: "estrela", estrela: true, quantidade: 14, distancia: 110 });
    }


    /* =============================================
       FORMULÁRIO: ENTRAR
    ============================================= */

    const formEntrar = document.getElementById("form-entrar");

    formEntrar.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const okEmail = validarEmail(formEntrar.email);
        const okSenha = validarSenha(formEntrar.senha);

        if (!okEmail || !okSenha) return;

        festa(formEntrar.querySelector(".auth-botao"));
        mostrarAviso("Login simulado — nenhum dado foi enviado!");

        formEntrar.reset();
    });


    /* =============================================
       FORMULÁRIO: CADASTRO
    ============================================= */

    const formCadastro = document.getElementById("form-cadastro");
    const erroTermos = formCadastro.querySelector(".campo-erro-termos");

    formCadastro.termos.addEventListener("change", () => {
        erroTermos.textContent = "";
    });

    formCadastro.addEventListener("submit", (evento) => {

        evento.preventDefault();

        const okNome = erroDoCampo(
            formCadastro.nome,
            formCadastro.nome.value.trim().length < 2 ? "Digite seu nome." : ""
        );

        const okEmail = validarEmail(formCadastro.email);
        const okSenha = validarSenha(formCadastro.senha, 6);

        let okConfirmar = true;

        if (!formCadastro.confirmar.value) {
            okConfirmar = erroDoCampo(formCadastro.confirmar, "Repita a senha.");
        } else if (formCadastro.confirmar.value !== formCadastro.senha.value) {
            okConfirmar = erroDoCampo(formCadastro.confirmar, "As senhas não são iguais.");
        } else {
            okConfirmar = erroDoCampo(formCadastro.confirmar, "");
        }

        const okTermos = formCadastro.termos.checked;

        erroTermos.textContent = okTermos ? "" : "Aceite os termos para continuar.";

        if (!(okNome && okEmail && okSenha && okConfirmar && okTermos)) return;

        festa(formCadastro.querySelector(".auth-botao"));
        mostrarAviso("Conta simulada — nenhum dado foi salvo!");

        formCadastro.reset();
    });


    /* =============================================
       MOSTRAR / OCULTAR SENHA
    ============================================= */

    document.querySelectorAll(".ver-senha").forEach(botao => {

        botao.addEventListener("click", () => {

            const campo = botao.parentElement.querySelector("input");
            const mostrando = campo.type === "text";

            campo.type = mostrando ? "password" : "text";

            botao.setAttribute("aria-pressed", String(!mostrando));
            botao.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
            botao.textContent = mostrando ? "👁" : "🙈";
        });
    });


    /* =============================================
       PERSONAGENS: pulinho ao clicar
    ============================================= */

    document.querySelectorAll(".auth-personagem").forEach(imagem => {

        imagem.addEventListener("click", () => {

            window.MarioFX && window.MarioFX.reiniciarAnimacao(imagem, "pulando", 600);

            if (window.MarioFX) {
                const caixa = imagem.getBoundingClientRect();
                window.MarioFX.moeda(caixa.left + caixa.width / 2, caixa.top + 20);
            }
        });
    });


    /* =============================================
       ÂNCORAS #entrar / #cadastro
       Destaca o card pedido (vindo do menu Perfil)
       e leva o foco ao primeiro campo.
    ============================================= */

    function destacar(id, comFoco) {

        const card = document.getElementById(id);

        if (!card || !card.classList.contains("auth-card")) return;

        document.querySelectorAll(".auth-card").forEach(c => c.classList.remove("destaque"));

        window.MarioFX && window.MarioFX.reiniciarAnimacao(card, "destaque", 1800);

        if (comFoco) {
            card.querySelector("input").focus({ preventScroll: true });
        }

        card.scrollIntoView({
            behavior: window.MarioFX && window.MarioFX.menosMovimento() ? "auto" : "smooth",
            block: "center"
        });
    }

    // Links "Criar conta" / "Entrar" dentro dos cards
    document.querySelectorAll("[data-ir]").forEach(link => {

        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            history.replaceState(null, "", "#" + link.dataset.ir);
            destacar(link.dataset.ir, true);
        });
    });

    // "Esqueci a senha": só visual
    document.querySelectorAll('.auth-link[href="#"]').forEach(link => {

        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            mostrarAviso("Recurso apenas ilustrativo nesta versão.");
        });
    });

    // Links do menu Perfil (mesma página, só muda o hash)
    window.addEventListener("hashchange", () => destacar(location.hash.slice(1), true));

    // Ao abrir a página já com #entrar ou #cadastro
    if (location.hash) {
        setTimeout(() => destacar(location.hash.slice(1), false), 350);
    }

})();
