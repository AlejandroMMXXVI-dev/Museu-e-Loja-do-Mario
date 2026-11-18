(function () {
    "use strict";

    const produtos = [
        {
            id: "odyssey",
            nome: "Super Mario Odyssey",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Explore reinos incríveis ao lado de Cappy.",
            preco: 299.9,
            imagem: "images/super_mario_Odyssey.avif",
            etiqueta: "Mais vendido"
        },
        {
            id: "wonder",
            nome: "Super Mario Bros. Wonder",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "O Reino das Flores nunca foi tão surpreendente.",
            preco: 279.9,
            imagem: "images/super_mario_bros_wonder.avif",
            etiqueta: "Novidade"
        },
        {
            id: "kart",
            nome: "Mario Kart 8 Deluxe",
            categoria: "corrida",
            categoriaLabel: "Corrida",
            descricao: "Acelere com todos os seus personagens favoritos.",
            preco: 289.9,
            imagem: "images/mario_kart_8D.avif",
            etiqueta: ""
        },
        {
            id: "zelda-tears",
            nome: "The Legend of Zelda: Tears of the Kingdom",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Construa, voe e desafie Hyrule em uma nova jornada.",
            preco: 349.9,
            capa: ["ZELDA", "#d7a31a", "Tears of the Kingdom"],
            etiqueta: "Grande aventura"
        },
        {
            id: "zelda-breath",
            nome: "The Legend of Zelda: Breath of the Wild",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Escute o chamado da aventura pelo vasto mundo de Hyrule.",
            preco: 319.9,
            capa: ["ZELDA", "#31552b", "Breath of the Wild"],
            etiqueta: "Essencial"
        },
        {
            id: "donkey-kong",
            nome: "Donkey Kong Country: Tropical Freeze",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Uma viagem cheia de ritmo pelos mundos tropicais.",
            preco: 249.9,
            capa: ["DONKEY KONG", "#7a3e16", "Tropical Freeze"],
            etiqueta: ""
        },
        {
            id: "mario-party",
            nome: "Super Mario Party Jamboree",
            categoria: "familia",
            categoriaLabel: "Família",
            descricao: "Minijogos, tabuleiros e muita diversão para todos.",
            preco: 329.9,
            capa: ["MARIO PARTY", "#b83a79", "Jamboree"],
            etiqueta: "Multijogador"
        },
        {
            id: "pikmin",
            nome: "Pikmin 4",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Comande os Pikmin e explore um planeta misterioso.",
            preco: 259.9,
            capa: ["PIKMIN", "#5f7f25", "Pikmin 4"],
            etiqueta: ""
        },
        {
            id: "luigis-mansion",
            nome: "Luigi's Mansion 3",
            categoria: "aventura",
            categoriaLabel: "Aventura",
            descricao: "Luigi enfrenta fantasmas em um hotel assustador.",
            preco: 239.9,
            capa: ["LUIGI", "#1b5e44", "Mansion 3"],
            etiqueta: "Família"
        },
        {
            id: "animal-crossing",
            nome: "Animal Crossing: New Horizons",
            categoria: "familia",
            categoriaLabel: "Família",
            descricao: "Construa seu paraíso em uma ilha cheia de amigos.",
            preco: 269.9,
            capa: ["ANIMAL CROSSING", "#4e9f91", "New Horizons"],
            etiqueta: ""
        },
        {
            id: "splatoon",
            nome: "Splatoon 3",
            categoria: "familia",
            categoriaLabel: "Família",
            descricao: "Entre na tinta e lute pela maior pontuação.",
            preco: 249.9,
            capa: ["SPLATOON", "#7632a8", "Splatoon 3"],
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
        if (produto.imagem) {
            const imagem = document.createElement("img");
            imagem.src = produto.imagem;
            imagem.alt = produto.nome;
            imagem.loading = "lazy";
            imagemCaixa.appendChild(imagem);
        } else if (produto.capa) {
            const capa = criarElemento("div", "produto-capa");
            capa.style.setProperty("--capa-fundo", `linear-gradient(145deg, ${produto.capa[1]}, #111a2f)`);
            capa.appendChild(criarElemento("small", "", produto.capa[0]));
            capa.appendChild(criarElemento("strong", "", produto.capa[2]));
            imagemCaixa.appendChild(capa);
        }

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
        let imagem;
        if (produto.imagem) {
            imagem = document.createElement("img");
            imagem.src = produto.imagem;
            imagem.alt = "";
        } else {
            imagem = criarElemento("div", "carrinho-capa");
            imagem.style.setProperty("--capa-fundo", `linear-gradient(145deg, ${produto.capa[1]}, #111a2f)`);
            imagem.textContent = produto.capa[0];
            imagem.setAttribute("aria-hidden", "true");
        }

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
        estado.carrinho.forEach((quantidade, id) => {
            if (!produtos.some(produto => produto.id === id) || quantidade <= 0) {
                estado.carrinho.delete(id);
            }
        });
        atualizarLocalStorage();

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
