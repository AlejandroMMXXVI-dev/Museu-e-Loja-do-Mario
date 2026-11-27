/* Sessão do usuário e compras salvas no navegador. */
(function () {
    "use strict";

    const CHAVE_USUARIOS = "mario_usuarios";
    const CHAVE_SESSAO = "mario_sessao";
    const CHAVE_COMPRAS = "mario_compras";

    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto ? JSON.parse(bruto) : padrao;
        } catch (erro) {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (erro) {
            return false;
        }
    }

    function usuarioAtual() {
        try {
            const email = localStorage.getItem(CHAVE_SESSAO);
            if (!email) return null;

            const u = ler(CHAVE_USUARIOS, []).find(x => x.email === email);
            return u ? { nome: u.nome, email: u.email, criadoEm: u.criadoEm } : null;
        } catch (erro) {
            return null;
        }
    }

    function sair() {
        try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { /* Ignora falhas ao limpar o storage. */ }
        window.dispatchEvent(new Event("auth:mudou"));
    }

    function comprasDoUsuario() {
        const u = usuarioAtual();
        if (!u) return [];
        return ler(CHAVE_COMPRAS, {})[u.email] || [];
    }

    function registrarCompra(itens) {
        const u = usuarioAtual();
        if (!u || !itens || !itens.length) return false;

        const todas = ler(CHAVE_COMPRAS, {});
        const data = new Date().toISOString();

        todas[u.email] = (todas[u.email] || []).concat(
            itens.map(item => Object.assign({}, item, { data: data }))
        );

        return gravar(CHAVE_COMPRAS, todas);
    }

    window.Auth = {
        usuarioAtual: usuarioAtual,
        sair: sair,
        comprasDoUsuario: comprasDoUsuario,
        registrarCompra: registrarCompra
    };


    // Atualiza o nome e as opções do menu conforme a sessão.

    let rotuloOriginal = null;
    let caixaOriginal = null;

    function criar(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto) el.textContent = texto; // Mostra o texto sem interpretar HTML.
        return el;
    }

    function atualizarNavbar() {

        const dropdown = document.querySelector(".perfil-dropdown");
        if (!dropdown) return;

        const resumo = dropdown.querySelector("summary");
        const caixa = dropdown.querySelector(".dropdown-conteudo");
        if (!resumo || !caixa) return;

        const textoNo = Array.from(resumo.childNodes)
            .find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());

        if (rotuloOriginal === null) {
            rotuloOriginal = textoNo ? textoNo.textContent : " Login ou Cadastro ";
            caixaOriginal = caixa.cloneNode(true);
        }

        const usuario = usuarioAtual();

        if (!usuario) {
            if (textoNo) textoNo.textContent = rotuloOriginal;
            caixa.replaceChildren(...Array.from(caixaOriginal.childNodes).map(n => n.cloneNode(true)));
            return;
        }

        if (textoNo) textoNo.textContent = " " + usuario.nome.split(" ")[0] + " ";

        const perfil = criar("a", "dropdown-entrar", "Meu perfil");
        perfil.href = "perfil.html";

        const botaoSair = criar("a", "dropdown-cadastrar", "Sair");
        botaoSair.href = "#";
        botaoSair.setAttribute("data-sair", "");

        caixa.replaceChildren(
            criar("p", "dropdown-titulo", "Olá, " + usuario.nome.split(" ")[0] + "!"),
            criar("p", "dropdown-descricao", usuario.email),
            perfil,
            botaoSair
        );
    }

    // Conecta os links de logout.
    document.addEventListener("click", (evento) => {
        if (!evento.target.closest("[data-sair]")) return;
        evento.preventDefault();
        sair();
    });

    window.addEventListener("auth:mudou", atualizarNavbar);
    window.addEventListener("storage", atualizarNavbar); // Atualiza o menu quando a sessão muda em outra aba.

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", atualizarNavbar);
    } else {
        atualizarNavbar();
    }
})();
