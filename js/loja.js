(function () {
    "use strict";

    const produtos = [
        {
            id: "mario",
            nome: "Mario, o herói",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "O encanador mais famoso do Reino Cogumelo.",
            preco: 89.9,
            imagem: "images/mario.png",
            etiqueta: "Mais vendido"
        },
        {
            id: "luigi",
            nome: "Luigi, o parceiro",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "Pronto para encarar qualquer fantasma.",
            preco: 84.9,
            imagem: "images/luigi.png",
            etiqueta: ""
        },
        {
            id: "peach",
            nome: "Princesa Peach",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "A governante mais querida do Reino Cogumelo.",
            preco: 92.5,
            imagem: "images/peach.png",
            etiqueta: ""
        },
        {
            id: "yoshi",
            nome: "Yoshi, o dinossauro",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "Um companheiro veloz para novas aventuras.",
            preco: 79.9,
            imagem: "images/yoshi.png",
            etiqueta: "Favorito"
        },
        {
            id: "bowser",
            nome: "Bowser, o rei dos Koopas",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "Um colecionável para quem gosta de desafios.",
            preco: 99.9,
            imagem: "images/bowser.png",
            etiqueta: ""
        },
        {
            id: "cogumelo",
            nome: "Cogumelo 1-UP",
            categoria: "power-ups",
            categoriaLabel: "Power-ups",
            descricao: "Mais uma vida para continuar jogando.",
            preco: 29.9,
            imagem: "images/super-cogumelo.png",
            etiqueta: "Power-up"
        },
        {
            id: "estrela",
            nome: "Superestrela",
            categoria: "power-ups",
            categoriaLabel: "Power-ups",
            descricao: "Um brilho especial para a sua coleção.",
            preco: 34.9,
            imagem: "images/super-estrela.png",
            etiqueta: "Power-up"
        },
        {
            id: "flor",
            nome: "Flor de fogo",
            categoria: "power-ups",
            categoriaLabel: "Power-ups",
            descricao: "Uma lembrança flamejante da aventura.",
            preco: 32.9,
            imagem: "images/flor-de-fogo.png",
            etiqueta: ""
        },
        {
            id: "moeda",
            nome: "Chaveiro de moeda",
            categoria: "acessorios",
            categoriaLabel: "Acessórios",
            descricao: "Leve um pedacinho do jogo com você.",
            preco: 19.9,
            imagem: "images/moeda.png",
            etiqueta: ""
        },
        {
            id: "toad",
            nome: "Toad, guardião do reino",
            categoria: "personagens",
            categoriaLabel: "Personagens",
            descricao: "Sempre pronto para compartilhar uma dica.",
            preco: 69.9,
            imagem: "images/toad.png",
            etiqueta: ""
        }
    ];

    const estado = {
        categoria: "todos",
        busca: "",
        ordenacao: "destaques",
        carrinho: new Map(JSON.parse(localStorage.getItem("mario-loja-carrinho") || "[]"))
    };

    const grade = document.getElementById("produtos-grade");
    const campoBusca = document.getElementById("busca-produtos");
    const campoOrdenacao = document.getElementById("ordenar-produtos");
    const resultado = document.getElementById("catalogo-resultado");
    const contadorCarrinho = document.getElementById("carrinho-contador");
    const itensCarrinho = document.getElementById("carrinho-itens");
    const totalCarrinho = document.getElementById("carrinho-total");
    const painelCarrinho = document.getElementById("carrinho-painel");
    const fundoCarrinho = document.getElementById("carrinho-fundo");
    const botaoAbrirCarrinho = document.getElementById("abrir-carrinho");
    const botaoFecharCarrinho = document.getElementById("fechar-carrinho");
    const toast = document.getElementById("loja-toast");
    let temporizadorToast;
    let focoAnterior = null;

    function formatarPreco(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(valor);
    }

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        if (texto) elemento.textContent = texto;
        return elemento;
    }

    function mostrarToast(mensagem) {
        toast.textContent = mensagem;
        toast.classList.add("visivel");
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 2400);
    }

    function obterProdutosFiltrados() {
        const busca = estado.busca.trim().toLocaleLowerCase("pt-BR");
        const filtrados = produtos.filter(produto => {
            const correspondeCategoria = estado.categoria === "todos"
                || produto.categoria === estado.categoria;
            const correspondeBusca = !busca
                || `${produto.nome} ${produto.categoriaLabel} ${produto.descricao}`
                    .toLocaleLowerCase("pt-BR")
                    .includes(busca);
            return correspondeCategoria && correspondeBusca;
        });

        if (estado.ordenacao === "menor-preco") {
            filtrados.sort((a, b) => a.preco - b.preco);
        } else if (estado.ordenacao === "maior-preco") {
            filtrados.sort((a, b) => b.preco - a.preco);
        } else if (estado.ordenacao === "nome") {
            filtrados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        }

        return filtrados;
    }

    function criarCard(produto) {
        const card = criarElemento("article", "produto-card");
        const imagemCaixa = criarElemento("div", "produto-imagem");
        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = produto.nome;
        imagem.loading = "lazy";
        imagemCaixa.appendChild(imagem);

        if (produto.etiqueta) {
            imagemCaixa.appendChild(criarElemento("span", "produto-etiqueta", produto.etiqueta));
        }

        const info = criarElemento("div", "produto-info");
        info.appendChild(criarElemento("p", "produto-categoria", produto.categoriaLabel));
        info.appendChild(criarElemento("h3", "", produto.nome));
        info.appendChild(criarElemento("p", "produto-descricao", produto.descricao));

        const compra = criarElemento("div", "produto-compra");
        compra.appendChild(criarElemento("span", "produto-preco", formatarPreco(produto.preco)));

        const botaoAdicionar = criarElemento("button", "produto-adicionar", "Adicionar");
        botaoAdicionar.type = "button";
        botaoAdicionar.setAttribute("aria-label", `Adicionar ${produto.nome} ao carrinho`);
        botaoAdicionar.addEventListener("click", () => {
            adicionarAoCarrinho(produto.id);
            botaoAdicionar.classList.remove("adicionado");
            void botaoAdicionar.offsetWidth;
            botaoAdicionar.classList.add("adicionado");
            botaoAdicionar.textContent = "Adicionado!";
            setTimeout(() => {
                botaoAdicionar.classList.remove("adicionado");
                botaoAdicionar.textContent = "Adicionar";
            }, 900);
            if (window.MarioFX) {
                const ret = botaoAdicionar.getBoundingClientRect();
                window.MarioFX.particulas(ret.left + ret.width / 2, ret.top + ret.height / 2, {
                    paleta: "moeda",
                    quantidade: 8,
                    distancia: 55,
                    tamanho: 7
                });
            }
        });
        compra.appendChild(botaoAdicionar);

        info.appendChild(compra);
        card.append(imagemCaixa, info);
        return card;
    }

    function renderizarProdutos() {
        const filtrados = obterProdutosFiltrados();
        grade.replaceChildren();
        resultado.textContent = `${filtrados.length} ${filtrados.length === 1 ? "produto encontrado" : "produtos encontrados"}`;

        if (!filtrados.length) {
            const vazio = criarElemento("p", "catalogo-vazio");
            vazio.appendChild(criarElemento("strong", "", "Nenhum produto encontrado"));
            vazio.appendChild(document.createTextNode("Tente mudar a categoria ou buscar por outro termo."));
            grade.appendChild(vazio);
            return;
        }

        filtrados.forEach(produto => grade.appendChild(criarCard(produto)));
    }

    function adicionarAoCarrinho(id) {
        const produto = produtos.find(item => item.id === id);
        if (!produto) return;

        estado.carrinho.set(id, (estado.carrinho.get(id) || 0) + 1);
        renderizarCarrinho();
        mostrarToast(`${produto.nome} adicionado ao carrinho.`);
        atualizarLocalStorage();
    }

    function alterarQuantidade(id, variacao) {
        const quantidade = (estado.carrinho.get(id) || 0) + variacao;
        if (quantidade <= 0) {
            estado.carrinho.delete(id);
        } else {
            estado.carrinho.set(id, quantidade);
        }
        renderizarCarrinho();
        atualizarLocalStorage();
    }

    function criarLinhaCarrinho(produto, quantidade) {
        const linha = criarElemento("div", "carrinho-linha");
        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = "";

        const detalhes = criarElemento("div", "");
        detalhes.appendChild(criarElemento("p", "carrinho-produto-nome", produto.nome));
        detalhes.appendChild(criarElemento("p", "carrinho-produto-preco", formatarPreco(produto.preco)));

        const controles = criarElemento("div", "carrinho-quantidade");
        const diminuir = criarElemento("button", "", "−");
        diminuir.type = "button";
        diminuir.setAttribute("aria-label", `Diminuir quantidade de ${produto.nome}`);
        diminuir.addEventListener("click", () => alterarQuantidade(produto.id, -1));

        const numero = criarElemento("span", "", String(quantidade));
        const aumentar = criarElemento("button", "", "+");
        aumentar.type = "button";
        aumentar.setAttribute("aria-label", `Aumentar quantidade de ${produto.nome}`);
        aumentar.addEventListener("click", () => alterarQuantidade(produto.id, 1));
        controles.append(diminuir, numero, aumentar);
        detalhes.appendChild(controles);

        const remover = criarElemento("button", "carrinho-remover", "Remover");
        remover.type = "button";
        remover.addEventListener("click", () => {
            estado.carrinho.delete(produto.id);
            renderizarCarrinho();
            atualizarLocalStorage();
        });

        linha.append(imagem, detalhes, remover);
        return linha;
    }

    function renderizarCarrinho() {
        const quantidadeTotal = Array.from(estado.carrinho.values())
            .reduce((soma, quantidade) => soma + quantidade, 0);
        const subtotal = Array.from(estado.carrinho.entries())
            .reduce((soma, [id, quantidade]) => {
                const produto = produtos.find(item => item.id === id);
                return soma + (produto ? produto.preco * quantidade : 0);
            }, 0);

        contadorCarrinho.textContent = String(quantidadeTotal);
        contadorCarrinho.setAttribute("aria-label", `${quantidadeTotal} itens no carrinho`);
        totalCarrinho.textContent = formatarPreco(subtotal);
        itensCarrinho.replaceChildren();

        if (!estado.carrinho.size) {
            itensCarrinho.appendChild(criarElemento(
                "p",
                "carrinho-vazio",
                "Seu carrinho está vazio. Explore a vitrine e escolha um item!"
            ));
            return;
        }

        estado.carrinho.forEach((quantidade, id) => {
            const produto = produtos.find(item => item.id === id);
            if (produto) itensCarrinho.appendChild(criarLinhaCarrinho(produto, quantidade));
        });

        localStorage.setItem("mario-loja-carrinho", JSON.stringify(Array.from(estado.carrinho.entries())));
    }

    function abrirCarrinho() {
        focoAnterior = document.activeElement;
        fundoCarrinho.hidden = false;
        painelCarrinho.inert = false;
        painelCarrinho.setAttribute("aria-hidden", "false");
        document.body.classList.add("carrinho-aberto");
        requestAnimationFrame(() => {
            painelCarrinho.classList.add("aberto");
            requestAnimationFrame(() => botaoFecharCarrinho.focus());
        });
    }

    function fecharCarrinho() {
        painelCarrinho.classList.remove("aberto");
        painelCarrinho.setAttribute("aria-hidden", "true");
        painelCarrinho.inert = true;
        document.body.classList.remove("carrinho-aberto");
        setTimeout(() => {
            fundoCarrinho.hidden = true;
        }, 260);
        if (focoAnterior && typeof focoAnterior.focus === "function") {
            focoAnterior.focus();
        }
    }

    function atualizarLocalStorage() {
        localStorage.setItem("mario-loja-carrinho", JSON.stringify(Array.from(estado.carrinho)));
    }

    document.querySelectorAll(".categoria-botao").forEach(botao => {
        botao.addEventListener("click", () => {
            estado.categoria = botao.dataset.categoria;
            document.querySelectorAll(".categoria-botao").forEach(item => {
                const ativo = item === botao;
                item.classList.toggle("ativo", ativo);
                item.setAttribute("aria-pressed", String(ativo));
            });
            renderizarProdutos();
        });
    });

    campoBusca.addEventListener("input", () => {
        estado.busca = campoBusca.value;
        renderizarProdutos();
    });

    campoOrdenacao.addEventListener("change", () => {
        estado.ordenacao = campoOrdenacao.value;
        renderizarProdutos();
    });

    botaoAbrirCarrinho.addEventListener("click", abrirCarrinho);
    botaoFecharCarrinho.addEventListener("click", fecharCarrinho);
    fundoCarrinho.addEventListener("click", fecharCarrinho);

    document.addEventListener("keydown", evento => {
        if (!painelCarrinho.classList.contains("aberto")) return;

        if (evento.key === "Escape") {
            fecharCarrinho();
            return;
        }

        if (evento.key === "Tab") {
            const elementosFocaveis = Array.from(painelCarrinho.querySelectorAll(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            ));
            const primeiro = elementosFocaveis[0];
            const ultimo = elementosFocaveis[elementosFocaveis.length - 1];

            if (!painelCarrinho.contains(document.activeElement)) {
                evento.preventDefault();
                (evento.shiftKey ? ultimo : primeiro).focus();
            } else if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primeiro.focus();
            }
        }
    });

    renderizarProdutos();
    renderizarCarrinho();
})();
