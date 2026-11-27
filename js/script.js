
// Seções do museu.

const secoes = [
    {
        elemento: "secao01",
        arquivo: "html_museu/secao01.html"
    },
    {
        elemento: "secao02",
        arquivo: "html_museu/secao02.html"
    },
    {
        elemento: "secao03",
        arquivo: "html_museu/secao03.html"
    }
];


// Carrega cada seção na página.

async function carregarSecoes() {

    for (const secao of secoes) {

        const resposta = await fetch(secao.arquivo);

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar: " + secao.arquivo
            );
        }

        const conteudo = await resposta.text();

        document.getElementById(secao.elemento).innerHTML = conteudo;

    }
    

}

function configurarWarpScroll() {

    const cano = document.querySelector(".warp-cano");

    if (!cano) {
        console.error("Imagem do cano não encontrada!");
        return;
    }

    function atualizarCano() {

        const alturaTela = window.innerHeight;

        const alturaPagina =
            document.documentElement.scrollHeight;

        const alturaCano =
            cano.getBoundingClientRect().height;

        const scrollAtual = window.scrollY;

        const scrollMaximo =
            alturaPagina - alturaTela;

        const movimentoMaximo =
            Math.max(0, alturaTela - alturaCano);

        const progresso = scrollMaximo > 0
            ? scrollAtual / scrollMaximo
            : 0;

        const posicao =
            progresso * movimentoMaximo;

        cano.style.top = `${posicao}px`;
    }

    // Atualiza durante a rolagem.
    window.addEventListener("scroll", atualizarCano);

    // Atualiza ao redimensionar a janela.
    window.addEventListener("resize", atualizarCano);

    // Espera o cano carregar.
    if (cano.complete) {
        atualizarCano();
    } else {
        cano.addEventListener("load", atualizarCano);
    }

    // Atualiza após o próximo frame.
    requestAnimationFrame(atualizarCano);

    console.log("Warp Pipe inicializada!");
}

// Personagens disponíveis no seletor.
const personagens = {

    mario: {
        nome: "Mario",
        categoria: "O HERÓI DO REINO",
        imagem: "images/mario.png",
        descricao: "Corajoso, determinado e sempre pronto para uma nova aventura! Mario é o grande herói do Reino dos Cogumelos. Desde sua estreia, em 1981, ele conquistou gerações e se tornou um dos personagens mais queridos da história dos videogames."
    },

    luigi: {
        nome: "Luigi",
        categoria: "O IRMÃO AVENTUREIRO",
        imagem: "images/luigi.png",
        descricao: "Alto, gentil e um pouquinho medroso, Luigi prova que coragem não significa não sentir medo, mas seguir em frente apesar dele. Ao lado de seu irmão Mario, vive aventuras inesquecíveis e conquista seu próprio espaço como herói."
    },

    peach: {
        nome: "Peach",
        categoria: "A PRINCESA DO REINO",
        imagem: "images/peach.png",
        descricao: "Gentil, elegante e de coração generoso, Peach é muito mais do que uma princesa. Ela representa a esperança do Reino dos Cogumelos e demonstra sua força e determinação em inúmeras aventuras ao lado de seus amigos."
    },

    toad: {
        nome: "Toad",
        categoria: "O AMIGO FIEL",
        imagem: "images/toad.png",
        descricao: "Pequeno no tamanho, mas enorme em entusiasmo! Toad é um dos moradores mais queridos do Reino dos Cogumelos. Sempre disposto a ajudar, ele acompanha Mario e seus amigos com alegria, lealdade e muita energia."
    },

    yoshi: {
        nome: "Yoshi",
        categoria: "O COMPANHEIRO LEAL",
        imagem: "images/yoshi.png",
        descricao: "Com seu jeito adorável e espírito aventureiro, Yoshi é um companheiro que todos gostariam de ter por perto. Esse simpático dinossauro ajuda Mario em momentos decisivos, enfrentando perigos com sua língua comprida, seus ovos e muita coragem."
    },

    bowser: {
        nome: "Bowser",
        categoria: "O REI DOS KOOPAS",
        imagem: "images/bowser.png",
        descricao: "Imponente, poderoso e dono de um temperamento explosivo, Bowser é o eterno rival de Mario. Rei dos Koopas, ele sonha em conquistar o Reino dos Cogumelos e vive protagonizando confrontos memoráveis com o herói."
    },

    donkeykong: {
        nome: "Donkey Kong",
        categoria: "O GIGANTE DA FLORESTA",
        imagem: "images/donkey_kong.png",
        descricao: "Forte, divertido e apaixonado por bananas, Donkey Kong é um verdadeiro ícone da Nintendo. Sua história começou em 1981, no jogo que apresentou Mario ao mundo. Desde então, conquistou seu próprio universo e uma legião de fãs."
    },

    wario: {
        nome: "Wario",
        categoria: "O RIVAL GANANCIOSO",
        imagem: "images/wario.png",
        descricao: "Barulhento, extravagante e completamente apaixonado por dinheiro, Wario é o rival que adora fazer tudo do seu próprio jeito. Apesar de suas travessuras e ambições, conquistou uma identidade única e protagoniza aventuras tão malucas quanto divertidas."
    },

    bowserjr: {
        nome: "Bowser Jr.",
        categoria: "O PEQUENO PRÍNCIPE KOOPA",
        imagem: "images/bowser_jr.png",
        descricao: "Filho de Bowser e herdeiro do Reino dos Koopas, Bowser Jr. é travesso, esperto e cheio de personalidade. Sempre ao lado de seu pai, participa de planos grandiosos e demonstra que, por trás de suas artimanhas, existe um pequeno Koopa muito ligado à família."
    },

    rosalina: {
        nome: "Rosalina",
        categoria: "A GUARDIÃ DAS ESTRELAS",
        imagem: "images/rosalina.png",
        descricao: "Misteriosa, serena e fascinada pelo universo, Rosalina é a protetora dos Lumas e uma viajante entre as estrelas. Sua história, marcada por descobertas, saudade e afeto, trouxe uma das narrativas mais emocionantes de toda a franquia."
    }

};



// Usa os efeitos extras quando o módulo da navbar está disponível.
const FX = window.MarioFX || {
    menosMovimento: () => true,
    reiniciarAnimacao: () => {},
    particulas: () => {},
    moeda: () => {}
};


function configurarSeletorPersonagens() {

    const botoes = document.querySelectorAll(".personagem-btn");

    const imagem = document.getElementById("imagem-personagem");
    const categoria = document.getElementById("categoria-personagem");
    const nome = document.getElementById("nome-personagem");
    const descricao = document.getElementById("descricao-personagem");

    if (!imagem || botoes.length === 0) return;

    const arte = imagem.closest(".personagem-arte");
    const info = document.querySelector(".personagem-info");

    // A ordem define a direção da transição.
    const ordem = Array.from(botoes).map(botao => botao.dataset.personagem);

    const ativoInicial = document.querySelector(".personagem-btn.ativo");

    let atual = ativoInicial ? ativoInicial.dataset.personagem : ordem[0];

    // Ignora a transição anterior se houver outro clique.
    let tokenTroca = 0;

    // Atualiza os dados do personagem.
    function aplicarDados(dados) {

        imagem.src = dados.imagem;
        imagem.alt = dados.nome;

        categoria.textContent = dados.categoria;
        nome.textContent = dados.nome;
        descricao.textContent = dados.descricao;
    }

    // Anima a saída do personagem atual e a entrada do próximo.
    function trocarComAnimacao(dados, direcao) {

        const meuToken = ++tokenTroca;

        if (FX.menosMovimento()) {
            aplicarDados(dados);
            return;
        }

        imagem.style.setProperty("--dir", direcao);

        imagem.classList.remove("troca-entrada");
        imagem.classList.add("troca-saida");

        if (info) {
            info.classList.remove("troca-entrada");
            info.classList.add("troca-saida");
        }

        setTimeout(() => {

            if (meuToken !== tokenTroca) return;

            // Carrega a imagem antes da troca.
            const preCarga = new Image();

            const concluir = () => {

                if (meuToken !== tokenTroca) return;

                aplicarDados(dados);

                imagem.classList.remove("troca-saida");
                if (info) info.classList.remove("troca-saida");

                // Reinicia a animação de entrada.
                void imagem.offsetWidth;

                imagem.classList.add("troca-entrada");
                if (info) info.classList.add("troca-entrada");
                if (arte) arte.classList.add("troca-brilho");

                setTimeout(() => {

                    if (meuToken !== tokenTroca) return;

                    imagem.classList.remove("troca-entrada");
                    if (info) info.classList.remove("troca-entrada");
                    if (arte) arte.classList.remove("troca-brilho");

                }, 750);
            };

            preCarga.onload = concluir;
            preCarga.onerror = concluir;
            preCarga.src = dados.imagem;

        }, 180);
    }

    botoes.forEach(botao => {

        botao.addEventListener("click", function() {

            const personagemSelecionado = this.dataset.personagem;

            const dados = personagens[personagemSelecionado];

            if (!dados) return;

            // Marca o botão selecionado.
            botoes.forEach(botao => {
                botao.classList.remove("ativo");
            });

            this.classList.add("ativo");

            // Dá retorno visual ao clique.
            FX.reiniciarAnimacao(this.querySelector("img"), "pulinho", 520);

            const caixa = this.getBoundingClientRect();

            FX.particulas(
                caixa.left + caixa.width / 2,
                caixa.top + 20,
                { quantidade: 7, distancia: 55, tamanho: 7, estrela: true, gravidade: 25 }
            );

            // Reaplica os dados sem animar a troca.
            if (personagemSelecionado === atual) {
                aplicarDados(dados);
                return;
            }

            const direcao =
                ordem.indexOf(personagemSelecionado) >= ordem.indexOf(atual) ? 1 : -1;

            atual = personagemSelecionado;

            trocarComAnimacao(dados, direcao);

        });

    });

    // O clique faz o personagem pular e solta uma moeda.
    imagem.addEventListener("click", () => {

        FX.reiniciarAnimacao(imagem, "pulando", 650);

        const caixa = imagem.getBoundingClientRect();

        FX.moeda(caixa.left + caixa.width / 2, caixa.top + caixa.height * 0.25);

    });

}


// Itens dos blocos misteriosos.

const descobertas = {
    cogumelo: {
        imagem: "images/super-cogumelo.png",
        nome: "Super Cogumelo",
        descricao: "Um dos itens mais clássicos da franquia! Ao encontrá-lo, Mario cresce e ganha uma nova chance na aventura."
    },

    flor: {
        imagem: "images/flor-de-fogo.png",
        nome: "Flor de Fogo",
        descricao: "Com esse poder, Mario consegue lançar bolas de fogo e enfrentar seus inimigos de uma maneira explosiva!"
    },

    estrela: {
        imagem: "images/super-estrela.png",
        nome: "Super Estrela",
        descricao: "Um dos itens mais especiais do Reino! Ela concede invencibilidade temporária ao personagem."
    },

    moeda: {
        imagem: "images/moeda.png",
        nome: "Moeda",
        descricao: "Presente em praticamente toda a franquia, as moedas recompensam a exploração e ajudam Mario em sua jornada."
    }
};


// Configura os blocos misteriosos.

function configurarBlocosMisteriosos() {

    const cards = document.querySelectorAll(".bloco-card");

    cards.forEach((card) => {

        const botao = card.querySelector(".botao-descobrir");
        const imagem = card.querySelector(".imagem-descoberta");
        const titulo = card.querySelector("h3");
        const descricao = card.querySelector(".bloco-descricao");
        const arte = card.querySelector(".bloco-arte");

        const item = card.dataset.item;

        // Salva os textos antes da primeira troca.
        titulo.dataset.original = titulo.textContent;
        descricao.dataset.original = descricao.textContent;

        // Centro do bloco, usado para posicionar os efeitos.
        function centroDoBloco() {
            const caixa = arte.getBoundingClientRect();
            return { x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2 };
        }

        // Restaura o bloco.
        function voltarAoBloco() {

            imagem.src = "images/caixa-interrogacao.png";
            imagem.alt = "Bloco de interrogação";

            titulo.textContent = titulo.dataset.original;
            descricao.textContent = descricao.dataset.original;

            botao.textContent = "CLIQUE PARA DESCOBRIR";

            card.classList.remove("descoberto");
        }

        // Mostra o item encontrado.
        function mostrarDescoberta(descoberta) {

            imagem.src = descoberta.imagem;
            imagem.alt = descoberta.nome;

            titulo.textContent = descoberta.nome;
            descricao.textContent = descoberta.descricao;

            botao.textContent = "VOLTAR AO BLOCO";

            card.classList.add("descoberto");
        }

        botao.addEventListener("click", () => {

            // Evita cliques repetidos durante a animação.
            if (card.dataset.ocupado === "1") return;

            // Restaura o bloco.
            if (card.classList.contains("descoberto")) {

                const { x, y } = centroDoBloco();

                voltarAoBloco();

                // Mostra a poeira quando o bloco volta ao lugar.
                FX.particulas(x, y + 30, {
                    paleta: "poeira",
                    quantidade: 8,
                    distancia: 60,
                    tamanho: 8,
                    gravidade: 20
                });

                FX.reiniciarAnimacao(card, "bloco-retorno", 600);
                FX.reiniciarAnimacao(card, "bloco-trocou", 600);

                return;
            }

            const descoberta = descobertas[item];

            if (!descoberta) return;

            // Sem animação, mostra o resultado direto.
            if (FX.menosMovimento()) {
                mostrarDescoberta(descoberta);
                return;
            }

            // O bloco sobe com o impacto.
            card.dataset.ocupado = "1";

            FX.reiniciarAnimacao(card, "bloco-impacto", 400);

            // O item aparece no ponto mais alto.
            setTimeout(() => {

                card.classList.remove("bloco-impacto");

                mostrarDescoberta(descoberta);

                FX.reiniciarAnimacao(card, "bloco-trocou", 600);

                const { x, y } = centroDoBloco();

                FX.particulas(x, y - 10, {
                    paleta: item,
                    quantidade: 14,
                    distancia: 110,
                    tamanho: 9,
                    estrela: item === "estrela" || item === "moeda"
                });

                if (item === "moeda") {
                    FX.moeda(x, y - 30);
                }

                card.dataset.ocupado = "0";

            }, 190);

        });

    });

}


// Revela o conteúdo das seções 02 e 03 ao rolar.

function prepararRevelacoes() {

    if (FX.menosMovimento()) return;

    const grupos = [];

    // A seção 02 tem cabeçalhos internos; usa o último.
    const cabecalhos02 = document.querySelectorAll("#nostalgia .cabecalho-personagens");

    if (cabecalhos02.length) {
        grupos.push({ elementos: [cabecalhos02[cabecalhos02.length - 1]], tipo: "rv-subir", passo: 0 });
    }

    grupos.push(
        { elementos: document.querySelectorAll("#nostalgia .personagem-principal"), tipo: "rv-subir", passo: 0, base: 0.1 },
        { elementos: document.querySelectorAll("#nostalgia .personagem-btn"),        tipo: "rv-pop",   passo: 0.06 },
        { elementos: document.querySelectorAll("#interesse .cabecalho-interesse"),   tipo: "rv-subir", passo: 0 },
        { elementos: document.querySelectorAll("#interesse .bloco-card"),            tipo: "rv-pop",   passo: 0.12 },
        { elementos: document.querySelectorAll("#interesse .encerramento-museu"),    tipo: "rv-subir", passo: 0 }
    );

    const todos = [];

    grupos.forEach(grupo => {

        Array.from(grupo.elementos).forEach((elemento, indice) => {

            elemento.classList.add("rv", grupo.tipo);

            elemento.style.setProperty(
                "--rv-atraso",
                ((grupo.base || 0) + indice * grupo.passo).toFixed(2) + "s"
            );

            todos.push(elemento);

        });

    });

    // Em navegadores sem IntersectionObserver, mostra tudo.
    if (!("IntersectionObserver" in window)) {
        todos.forEach(elemento => elemento.classList.add("revelado"));
        return;
    }

    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach(entrada => {

            if (!entrada.isIntersecting) return;

            entrada.target.classList.add("revelado");

            observador.unobserve(entrada.target);

        });

    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    todos.forEach(elemento => observador.observe(elemento));

}


// Decorações flutuantes das seções 02 e 03.

const itensFlutuantes = {

    "#nostalgia": [
        { imagem: "images/moeda.png",         x: "11%", y: "7%",  tamanho: 52, vel: -0.10, duracao: 5.2, atraso: 0 },
        { imagem: "images/super-estrela.png", x: "84%", y: "14%", tamanho: 58, vel:  0.14, duracao: 6.0, atraso: -2 },
        { imagem: "images/super-cogumelo.png", x: "6%", y: "72%", tamanho: 50, vel:  0.08, duracao: 4.6, atraso: -1 }
    ],

    "#interesse": [
        { imagem: "images/flor-de-fogo.png",  x: "85%", y: "5%",  tamanho: 54, vel: -0.12, duracao: 5.6, atraso: -1 },
        { imagem: "images/moeda.png",         x: "8%",  y: "11%", tamanho: 48, vel:  0.10, duracao: 4.8, atraso: -3 },
        { imagem: "images/super-estrela.png", x: "90%", y: "86%", tamanho: 52, vel: -0.08, duracao: 6.2, atraso: 0 }
    ]

};

function criarFlutuantes() {

    Object.keys(itensFlutuantes).forEach(seletor => {

        const secao = document.querySelector(seletor);

        if (!secao || secao.querySelector(".fx-flutuantes")) return;

        const camada = document.createElement("div");

        camada.className = "fx-flutuantes";
        camada.setAttribute("aria-hidden", "true");

        itensFlutuantes[seletor].forEach(dados => {

            const item = document.createElement("span");

            item.className = "fx-item";
            item.dataset.vel = dados.vel;

            item.style.setProperty("--x", dados.x);
            item.style.setProperty("--y", dados.y);
            item.style.setProperty("--t", dados.tamanho + "px");
            item.style.setProperty("--dur", dados.duracao + "s");
            item.style.setProperty("--atraso", dados.atraso + "s");

            const figura = document.createElement("img");

            figura.src = dados.imagem;
            figura.alt = "";
            figura.draggable = false;

            // Ignora a decoração se a imagem não existir.
            figura.onerror = () => item.remove();

            item.appendChild(figura);
            camada.appendChild(item);

        });

        secao.prepend(camada);

    });

}

function configurarParallax() {

    if (FX.menosMovimento()) return;

    const grupos = Array.from(document.querySelectorAll(".fx-flutuantes")).map(camada => ({
        secao: camada.parentElement,
        camada: camada,
        visivel: false
    }));

    if (!grupos.length || !("IntersectionObserver" in window)) return;

    let pendente = false;

    function atualizar() {

        pendente = false;

        const meioDaTela = window.innerHeight / 2;

        grupos.forEach(grupo => {

            if (!grupo.visivel) return;

            const caixa = grupo.secao.getBoundingClientRect();

            const deslocamento = (caixa.top + caixa.height / 2) - meioDaTela;

            grupo.camada.querySelectorAll(".fx-item").forEach(item => {

                const velocidade = parseFloat(item.dataset.vel) || 0;

                item.style.setProperty(
                    "--py",
                    (deslocamento * velocidade).toFixed(1) + "px"
                );

            });

        });

    }

    function agendar() {

        if (pendente) return;

        pendente = true;

        requestAnimationFrame(atualizar);
    }

    // Atualiza apenas as seções visíveis.
    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach(entrada => {

            const grupo = grupos.find(g => g.secao === entrada.target);

            if (grupo) grupo.visivel = entrada.isIntersecting;

        });

        agendar();

    }, { rootMargin: "120px 0px" });

    grupos.forEach(grupo => observador.observe(grupo.secao));

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);

}


carregarSecoes()
    .then(() => {
        configurarSeletorPersonagens();
        configurarWarpScroll();
        configurarBlocosMisteriosos();

        prepararRevelacoes();
        criarFlutuantes();
        configurarParallax();

        if (window.MarioNav) {
            window.MarioNav.iniciarScrollspy();
        }
    })
    .catch((erro) => {
        console.error("Erro ao montar o museu:", erro);
    });
