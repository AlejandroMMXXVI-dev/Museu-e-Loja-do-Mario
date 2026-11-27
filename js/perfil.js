/* Perfil do usuário e jogos comprados. */
(function () {
    "use strict";

    const deslogado = document.getElementById("perfil-deslogado");
    const logado = document.getElementById("perfil-logado");
    const lista = document.getElementById("lista-compras");

    function criar(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto) el.textContent = texto;
        return el;
    }

    function preco(valor) {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    }

    function data(iso) {
        const d = new Date(iso);
        return isNaN(d) ? "" : d.toLocaleDateString("pt-BR");
    }

    function criarTitulo(compra) {
        const h3 = criar("h3");
        const a = criar("a", "", compra.nome);
        a.href = "jogo.html?id=" + encodeURIComponent(compra.id);
        h3.appendChild(a);
        return h3;
    }

    function cardDaCompra(compra) {

        const card = criar("article", "compra-card");

        let capa;
        if (compra.imagem) {
            capa = document.createElement("img");
            capa.src = compra.imagem;
            capa.alt = compra.nome;
        } else {
            capa = criar("div", "compra-capa", compra.nome);
            const cor = compra.capa && compra.capa[1] ? compra.capa[1] : "#003b91";
            capa.style.setProperty("--capa-fundo", "linear-gradient(145deg, " + cor + ", #111a2f)");

            // Busca a capa na API se não houver uma imagem local.
            window.Midia.buscar(compra.nome).then(m => {
                if (!m.foto || !capa.isConnected) return;
                const img = document.createElement("img");
                img.src = m.foto;
                img.alt = compra.nome;
                capa.replaceWith(img);
            });
        }

        card.append(
            capa,
            criarTitulo(compra),
            criar("p", "", "Quantidade: " + compra.qtd + " · " + preco(compra.preco * compra.qtd)),
            criar("p", "", "Data da compra: " + data(compra.data))
        );

        return card;
    }

    function renderizar() {

        const usuario = window.Auth.usuarioAtual();

        deslogado.hidden = !!usuario;
        logado.hidden = !usuario;

        if (!usuario) return;

        const compras = window.Auth.comprasDoUsuario();
        const jogos = compras.reduce((soma, c) => soma + c.qtd, 0);
        const total = compras.reduce((soma, c) => soma + c.preco * c.qtd, 0);

        document.getElementById("perfil-nome").textContent = usuario.nome;
        document.getElementById("perfil-email").textContent = usuario.email;
        document.getElementById("perfil-desde").textContent =
            usuario.criadoEm ? "Membro desde " + data(usuario.criadoEm) : "";

        document.getElementById("stat-nivel").textContent = String(1 + Math.floor(jogos / 2));
        document.getElementById("stat-jogos").textContent = String(jogos);
        document.getElementById("stat-total").textContent = preco(total);

        lista.replaceChildren();

        if (!compras.length) {
            const vazio = criar("p", "compras-vazio", "Você ainda não comprou nenhum jogo. ");
            const link = criar("a", "", "Ir para a loja");
            link.href = "loja.html";
            vazio.appendChild(link);
            lista.appendChild(vazio);
            return;
        }

        // Mostra primeiro as compras mais recentes.
        compras.slice().reverse().forEach(c => lista.appendChild(cardDaCompra(c)));
    }

    window.addEventListener("auth:mudou", renderizar);
    renderizar();
})();
