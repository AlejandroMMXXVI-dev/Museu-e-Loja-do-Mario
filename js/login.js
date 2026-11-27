/* Login e cadastro ficam no navegador; isso não substitui uma autenticação real. */

(function () {

    "use strict";

    // Página aberta depois do login.
    const PAGINA_DESTINO = "perfil.html";

    // Chaves usadas para guardar usuários e sessão.
    const CHAVE_USUARIOS = "mario_usuarios";
    const CHAVE_SESSAO   = "mario_sessao";

    const toast = document.getElementById("auth-toast");
    let tempoToast = null;


    // Aviso temporário na tela.

    function mostrarAviso(texto) {

        if (!toast) return;

        toast.textContent = texto;
        toast.classList.add("visivel");

        clearTimeout(tempoToast);

        tempoToast = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 3500);
    }


    // Leitura e gravação das contas no navegador.

    function lerUsuarios() {

        try {
            const bruto = localStorage.getItem(CHAVE_USUARIOS);
            return bruto ? JSON.parse(bruto) : [];
        } catch (erro) {
            return []; // Ignora dados inválidos e começa sem usuários.
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
        } catch (erro) { /* A sessão pode já ter sido encerrada. */ }

        // Avisa o restante do site que a sessão mudou.
        window.dispatchEvent(new Event("auth:mudou"));
    }


    // Gera um hash local para a senha.

    async function hashSenha(senha) {

        if (window.crypto && window.crypto.subtle) {

            const bytes = new TextEncoder().encode(senha);
            const resumo = await crypto.subtle.digest("SHA-256", bytes);

            return Array.from(new Uint8Array(resumo))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        }

        // Usa um hash simples se o Web Crypto não estiver disponível.
        let h = 5381;

        for (let i = 0; i < senha.length; i++) {
            h = ((h << 5) + h) + senha.charCodeAt(i);
            h |= 0;
        }

        return "simples-" + h;
    }


    // Validação dos campos.

    const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function erroDoCampo(campo, mensagem) {

        const caixa = campo.closest(".campo");
        const aviso = caixa.querySelector(".campo-erro");

        caixa.classList.remove("invalido");
        void caixa.offsetWidth; // Reinicia a animação.

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

    // Remove o erro quando o campo é editado.
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


    // Efeito após login ou cadastro.

    function festa(botao) {

        if (!window.MarioFX) return;

        const caixa = botao.getBoundingClientRect();
        const x = caixa.left + caixa.width / 2;
        const y = caixa.top;

        window.MarioFX.moeda(x, y);
        window.MarioFX.particulas(x, y, { paleta: "estrela", estrela: true, quantidade: 14, distancia: 110 });
    }

    // Dá tempo de ver a animação antes de redirecionar.
    function irParaDestino() {
        setTimeout(() => {
            window.location.href = PAGINA_DESTINO;
        }, 1400);
    }


    // Login.

    const formEntrar = document.getElementById("form-entrar");

    formEntrar.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const okEmail = validarEmail(formEntrar.email);
        const okSenha = validarSenha(formEntrar.senha);

        if (!okEmail || !okSenha) return;

        const usuario = acharUsuario(formEntrar.email.value);

        // A mesma mensagem evita revelar se o e-mail está cadastrado.
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


    // Cadastro.

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

        // Não permite cadastrar o mesmo e-mail duas vezes.
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

        // Inicia a sessão após o cadastro.
        entrar(novo.email);
        window.dispatchEvent(new Event("auth:mudou"));

        festa(formCadastro.querySelector(".auth-botao"));
        mostrarAviso("Conta criada! Bem-vindo, " + nome.split(" ")[0] + "!");

        formCadastro.reset();
        irParaDestino();
    });


    // Exibe ou oculta a senha.

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


    // Encerra a sessão pelos links com data-sair.

    document.addEventListener("click", (evento) => {

        const botaoSair = evento.target.closest("[data-sair]");

        if (!botaoSair) return;

        evento.preventDefault();

        sair();
        mostrarAviso("Você saiu da conta.");
    });


    // Efeito ao clicar nos personagens.

    document.querySelectorAll(".auth-personagem").forEach(imagem => {

        imagem.addEventListener("click", () => {

            window.MarioFX && window.MarioFX.reiniciarAnimacao(imagem, "pulando", 600);

            if (window.MarioFX) {
                const caixa = imagem.getBoundingClientRect();
                window.MarioFX.moeda(caixa.left + caixa.width / 2, caixa.top + 20);
            }
        });
    });


    // Links dos formulários.

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

    // Alterna entre os formulários.
    document.querySelectorAll("[data-ir]").forEach(link => {

        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            history.replaceState(null, "", "#" + link.dataset.ir);
            destacar(link.dataset.ir, true);
        });
    });

    // A recuperação de senha ainda não está disponível.
    document.querySelectorAll('.auth-link[href="#"]').forEach(link => {

        link.addEventListener("click", (evento) => {
            evento.preventDefault();
            mostrarAviso("Recurso ainda não disponível nesta versão.");
        });
    });

    // Abre o formulário indicado pelo menu.
    window.addEventListener("hashchange", () => destacar(location.hash.slice(1), true));

    // Destaca o formulário se a página abrir com um hash.
    if (location.hash) {
        setTimeout(() => destacar(location.hash.slice(1), false), 350);
    }


    // Avisa quando já há uma sessão ativa.

    const logado = usuarioAtual();

    if (logado) {
        mostrarAviso("Você já está logado como " + logado.nome + ".");
    }


    // API de sessão usada pelo restante do site.

    window.Auth = {
        usuarioAtual: usuarioAtual,
        sair: sair
    };

})();