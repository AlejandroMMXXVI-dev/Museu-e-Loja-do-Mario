/* Detalhes do jogo, compra e galeria. */
(function () {
    "use strict";

    const CHAVE_CARRINHO = "mario-loja-carrinho";

    const id = new URLSearchParams(window.location.search).get("id");
    const produto = (window.CATALOGO || []).find(p => p.id === id);
    const $ = (seletor) => document.getElementById(seletor);

    function criar(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto) el.textContent = texto;
        return el;
    }

    function preco(valor) {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    }

    if (!produto) {
        const raiz = $("jogo-raiz");
        const aviso = criar("p", "", "Jogo não encontrado. ");
        const voltar = criar("a", "", "Voltar para a loja");
        voltar.href = "loja.html";
        aviso.appendChild(voltar);
        raiz.replaceChildren(aviso);
        return;
    }


    /* =============================================
       TOPO + COMPRA
    ============================================= */

    document.title = produto.nome + " - Museu do Mario";
    $("jogo-crumb").textContent = produto.nome;
    $("jogo-nome").textContent = produto.nome;
    $("jogo-resumo").textContent = produto.descricao;
    $("compra-titulo").textContent = "Comprar " + produto.nome;
    $("compra-preco").textContent = preco(produto.preco);

    function capaLocal() {
        if (produto.imagem) {
            const img = document.createElement("img");
            img.src = produto.imagem;
            img.alt = produto.nome;
            return img;
        }
        const capa = criar("div", "produto-capa");
        capa.style.setProperty("--capa-fundo", "linear-gradient(145deg, " + produto.capa[1] + ", #111a2f)");
        capa.append(criar("small", "", produto.capa[0]), criar("strong", "", produto.capa[2]));
        return capa;
    }

    $("jogo-capsula").replaceChildren(capaLocal());

    let toastTempo;
    function toast(texto, comLink) {
        $("jogo-toast-texto").textContent = texto;
        $("jogo-toast-link").hidden = !comLink;
        $("jogo-toast").classList.add("visivel");
        clearTimeout(toastTempo);
        toastTempo = setTimeout(() => $("jogo-toast").classList.remove("visivel"), 3500);
    }

    function jaComprou() {
        return window.Auth.comprasDoUsuario().some(c => c.id === produto.id);
    }

    function atualizarBotoes() {
        const tem = jaComprou();
        $("btn-comprar").disabled = tem;
        $("btn-comprar").textContent = tem ? "✓ Na sua biblioteca" : "Comprar agora";
        $("btn-carrinho").hidden = tem;
    }

    $("btn-carrinho").addEventListener("click", () => {
        let lista = [];
        try { lista = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]"); } catch (erro) { /* Ignora dados inválidos do carrinho. */ }

        const carrinho = new Map(lista);
        carrinho.set(produto.id, (carrinho.get(produto.id) || 0) + 1);

        try {
            localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(Array.from(carrinho)));
            toast("Adicionado ao carrinho.", true);
        } catch (erro) {
            toast("Não consegui salvar o carrinho.", false);
        }
    });

    $("btn-comprar").addEventListener("click", () => {
        if (!window.Auth.usuarioAtual()) {
            toast("Entre na sua conta para comprar.", false);
            setTimeout(() => { window.location.href = "login.html#entrar"; }, 1400);
            return;
        }

        const ok = window.Auth.registrarCompra([{
            id: produto.id, nome: produto.nome, preco: produto.preco, qtd: 1,
            imagem: produto.imagem || null, capa: produto.capa || null
        }]);

        if (!ok) { toast("Não consegui salvar a compra.", false); return; }

        toast("Compra realizada! Abrindo seu perfil...", false);
        setTimeout(() => { window.location.href = "perfil.html"; }, 1300);
    });

    window.addEventListener("auth:mudou", atualizarBotoes);
    atualizarBotoes();


    /* =============================================
       GALERIA (screenshots)
    ============================================= */

    let itens = [];
    let atual = 0;

    const principal = $("midia-principal");
    const miniaturas = $("midia-thumbs");

    function mostrar(i) {

        atual = (i + itens.length) % itens.length;
        const item = itens[atual];

        let el;
        if (item.tipo === "capa") {
            el = capaLocal();
        } else {
            el = document.createElement("img");
            el.src = item.src;
            el.alt = "Imagem de " + produto.nome;
        }

        const setas = [];
        if (itens.length > 1) {
            const ant = criar("button", "midia-seta ant", "‹");
            const prox = criar("button", "midia-seta prox", "›");
            ant.type = prox.type = "button";
            ant.setAttribute("aria-label", "Anterior");
            prox.setAttribute("aria-label", "Próximo");
            ant.addEventListener("click", () => mostrar(atual - 1));
            prox.addEventListener("click", () => mostrar(atual + 1));
            setas.push(ant, prox);
        }

        principal.replaceChildren(el, ...setas);

        Array.from(miniaturas.children).forEach((m, n) => m.classList.toggle("ativo", n === atual));
    }

    function montarGaleria() {

        miniaturas.replaceChildren();

        itens.forEach((item, i) => {
            const botao = criar("button", "midia-thumb");
            botao.type = "button";
            botao.setAttribute("aria-label", "Mídia " + (i + 1));

            const miniatura = document.createElement("img");
            miniatura.alt = "";
            miniatura.src = item.src || produto.imagem || "";
            if (miniatura.src) botao.appendChild(miniatura);

            botao.addEventListener("click", () => mostrar(i));
            miniaturas.appendChild(botao);
        });

        if (itens.length < 2) miniaturas.replaceChildren();

        mostrar(0);
    }

    // Mostra primeiro a imagem local, se houver.
    itens = [produto.imagem ? { tipo: "imagem", src: produto.imagem } : { tipo: "capa" }];
    montarGaleria();


    /* =============================================
       DETALHES DA API
    ============================================= */

    function linha(rotulo, valor) {
        if (!valor) return;
        const dd = criar("dd");
        if (valor instanceof Node) dd.appendChild(valor); else dd.textContent = valor;
        $("jogo-info").append(criar("dt", "", rotulo), dd);
    }

    function data(iso) {
        const d = new Date(iso + "T12:00:00");
        return isNaN(d) ? iso : d.toLocaleDateString("pt-BR");
    }

    function preencher(d) {

        // Atualiza a galeria com as imagens recebidas.
        const nova = [];
        d.screenshots.forEach(src => nova.push({ tipo: "imagem", src: src }));
        if (!d.screenshots.length && d.foto) nova.push({ tipo: "imagem", src: d.foto });
        if (nova.length) { itens = nova; montarGaleria(); }

        if (d.foto) {
            const capsula = document.createElement("img");
            capsula.src = d.foto;
            capsula.alt = produto.nome;
            $("jogo-capsula").replaceChildren(capsula);
        }

        $("jogo-info").replaceChildren();
        linha("Lançamento", d.lancamento && data(d.lancamento));
        linha("Desenvolvedora", d.desenvolvedoras.join(", "));
        linha("Publicadora", d.publicadoras.join(", "));
        linha("Plataformas", d.plataformas.slice(0, 4).join(", "));
        if (d.metacritic) linha("Metacritic", criar("span", "nota-pill", String(d.metacritic)));

        $("jogo-tags").replaceChildren(...d.generos.map(g => criar("span", "tag", g)));

        if (d.descricao) {
            $("secao-sobre").hidden = false;
            $("jogo-sobre").textContent = d.descricao;

            if (d.descricao.length > 450) {
                const botao = $("ler-mais");
                botao.hidden = false;
                botao.addEventListener("click", () => {
                    const aberto = $("jogo-sobre").classList.toggle("recolhido");
                    botao.textContent = aberto ? "Ler mais" : "Ler menos";
                });
            } else {
                $("jogo-sobre").classList.remove("recolhido");
            }
        }
    }

    if (!window.Midia.temChave()) {
        $("api-aviso").hidden = false;
    } else {
        window.Midia.detalhes(produto.nome).then(d => {
            if (d) preencher(d);
        });
    }
})();
