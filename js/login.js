/* =================================================
   PÁGINA DE LOGIN — cadastro e login com localStorage

   Não tem servidor nem banco de dados: os usuários ficam
   guardados no navegador (localStorage). Serve bem pra
   projeto de faculdade, mas NÃO é seguro de verdade.

   Usa window.MarioFX (js/navbar.js) para os efeitos.

   Também cria o window.Auth, que outras páginas (tipo a
   navbar) podem usar:
     Auth.usuarioAtual()  -> { nome, email } ou null
     Auth.sair()          -> faz logout
   Qualquer elemento com o atributo data-sair vira botão de sair.
================================================= */

(function () {

    "use strict";

    // Pra onde ir depois de entrar (troca pelo nome da tua página)
    const PAGINA_DESTINO = "index.html";

    // Nomes das chaves no localStorage
    const CHAVE_USUARIOS = "mario_usuarios";   // lista de todas as contas
    const CHAVE_SESSAO   = "mario_sessao";     // email de quem está logado

    const toast = document.getElementById("auth-toast");
    let tempoToast = null;


    /* =============================================
       AVISO (TOAST)
    ============================================= */

    function mostrarAviso(texto) {

        if (!toast) return;

        toast.textContent = texto;
        toast.classList.add("visivel");

        clearTimeout(tempoToast);

        tempoToast = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 3500);
    }


    /* =============================================
       LOCALSTORAGE: usuários e sessão
       (tudo com try/catch porque o navegador pode
       bloquear o storage em aba anônima, por ex.)
    ============================================= */

    function lerUsuarios() {

        try {
            const bruto = localStorage.getItem(CHAVE_USUARIOS);
            return bruto ? JSON.parse(bruto) : [];
        } catch (erro) {
            return [];   // se deu ruim, trata como se não tivesse ninguém
        }
    }

    function salvarUsuarios(lista) {

        try {
            localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
            return true;
        } catch (erro) {
            return false;
        }
    }

    function acharUsuario(email) {

        const procurado = email.trim().toLowerCase();

        return lerUsuarios().find(u => u.email === procurado) || null;
    }

    function usuarioAtual() {

        try {
            const email = localStorage.getItem(CHAVE_SESSAO);
            if (!email) return null;

            const usuario = acharUsuario(email);

            return usuario ? { nome: usuario.nome, email: usuario.email } : null;
        } catch (erro) {
            return null;
        }
    }

    function entrar(email) {
        localStorage.setItem(CHAVE_SESSAO, email);
    }

    function sair() {

        try {
            localStorage.removeItem(CHAVE_SESSAO);
        } catch (erro) { /* sem o que fazer */ }

        // Avisa o resto do site (a navbar pode escutar isso)
        window.dispatchEvent(new Event("auth:mudou"));
    }


    /* =============================================
       HASH DA SENHA
       Pelo menos não guarda a senha escrita lá em texto
       puro. Usa SHA-256 quando o navegador deixa
       (crypto.subtle só funciona em https ou localhost).
       Se não deixar, cai num hash simplão.
    ============================================= */

    async function hashSenha(senha) {

        if (window.crypto && window.crypto.subtle) {

            const bytes = new TextEncoder().encode(senha);
            const resumo = await crypto.subtle.digest("SHA-256", bytes);

            return Array.from(new Uint8Array(resumo))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        }

        // Plano B: hash simples (djb2). Fraco, mas melhor que nada
        let h = 5381;

        for (let i = 0; i < senha.length; i++) {
            h = ((h << 5) + h) + senha.charCodeAt(i);
            h |= 0;
        }

        return "simples-" + h;
    }


    /* =============================================
       VALIDAÇÃO VISUAL
    ============================================= */

    const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function erroDoCampo(campo, mensagem) {

        const caixa = campo.closest(".campo");
        const aviso = caixa.querySelector(".campo-erro");

        caixa.classList.remove("invalido");
        void caixa.offsetWidth;                // truque pra reiniciar a animação

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

    // Quando a pessoa volta a digitar, o erro daquele campo some
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

    // Espera um pouquinho (pra dar tempo de ver a festa) e vai pra outra página
    function irParaDestino() {
        setTimeout(() => {
            window.location.href = PAGINA_DESTINO;
        }, 1400);
    }


    /* =============================================
       FORMULÁRIO: ENTRAR
    ============================================= */

    const formEntrar = document.getElementById("form-entrar");

    formEntrar.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const okEmail = validarEmail(formEntrar.email);
        const okSenha = validarSenha(formEntrar.senha);

        if (!okEmail || !okSenha) return;

        const usuario = acharUsuario(formEntrar.email.value);

        // Mesma mensagem pros dois casos, pra não entregar qual e-mail existe
        if (!usuario) {
            erroDoCampo(formEntrar.senha, "E-mail ou senha incorretos.");
            return;
        }

        const hash = await hashSenha(formEntrar.senha.value);

        if (hash !== usuario.senha) {
            erroDoCampo(formEntrar.senha, "E-mail ou senha incorretos.");
            return;
        }

        try {
            entrar(usuario.email);
        } catch (erro) {
            mostrarAviso("Não consegui salvar o login. O navegador está bloqueando o armazenamento?");
            return;
        }

        window.dispatchEvent(new Event("auth:mudou"));

        festa(formEntrar.querySelector(".auth-botao"));
        mostrarAviso("Bem-vindo de volta, " + usuario.nome.split(" ")[0] + "!");

        formEntrar.reset();
        irParaDestino();
    });


    /* =============================================
       FORMULÁRIO: CADASTRO
    ============================================= */

    const formCadastro = document.getElementById("form-cadastro");
    const erroTermos = formCadastro.querySelector(".campo-erro-termos");

    formCadastro.termos.addEventListener("change", () => {
        erroTermos.textContent = "";
    });

    formCadastro.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const nome = formCadastro.nome.value.trim();

        const okNome = erroDoCampo(
            formCadastro.nome,
            nome.length < 2 ? "Digite seu nome." : ""
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

        // E-mail repetido? Não pode ter duas contas iguais
        if (acharUsuario(formCadastro.email.value)) {
            erroDoCampo(formCadastro.email, "Esse e-mail já tem uma conta.");
            return;
        }

        const novo = {
            nome: nome,
            email: formCadastro.email.value.trim().toLowerCase(),
            senha: await hashSenha(formCadastro.senha.value),
            criadoEm: new Date().toISOString()
        };

        const lista = lerUsuarios();
        lista.push(novo);

        if (!salvarUsuarios(lista)) {
            mostrarAviso("Não deu pra salvar a conta. O armazenamento do navegador está bloqueado?");
            return;
        }

        // Já deixa a pessoa logada depois de criar a conta
        entrar(novo.email);
        window.dispatchEvent(new Event("auth:mudou"));

        festa(formCadastro.querySelector(".auth-botao"));
        mostrarAviso("Conta criada! Bem-vindo, " + nome.split(" ")[0] + "!");

        formCadastro.reset();
        irParaDestino();
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
       LOGOUT
       Qualquer botão/link com data-sair faz logout.
       Ex: <button data-sair>Sair</button>
    ============================================= */

    document.addEventListener("click", (evento) => {

        const botaoSair = evento.target.closest("[data-sair]");

        if (!botaoSair) return;

        evento.preventDefault();

        sair();
        mostrarAviso("Você saiu da conta.");
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
       e leva o foco pro primeiro campo.
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

    // "Esqueci a senha": ainda não faz nada de verdade
    document.querySelectorAll('.auth-link[href="#"]').forEach(link => {

        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            mostrarAviso("Recurso ainda não disponível nesta versão.");
        });
    });

    // Links do menu Perfil (mesma página, só muda o hash)
    window.addEventListener("hashchange", () => destacar(location.hash.slice(1), true));

    // Se a página abriu já com #entrar ou #cadastro
    if (location.hash) {
        setTimeout(() => destacar(location.hash.slice(1), false), 350);
    }


    /* =============================================
       JÁ ESTÁ LOGADO?
       Se a pessoa abrir a tela de login com sessão
       ativa, só avisa quem está logado.
    ============================================= */

    const logado = usuarioAtual();

    if (logado) {
        mostrarAviso("Você já está logado como " + logado.nome + ".");
    }


    /* =============================================
       Deixa o Auth disponível pro resto do site
    ============================================= */

    window.Auth = {
        usuarioAtual: usuarioAtual,
        sair: sair
    };

})();