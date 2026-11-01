
// Arquivos HTML que serão carregados

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


// Carregar as seções na página

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
    
    configurarSeletorPersonagens();

    // =================================
// WARP PIPE SCROLL
// =================================

// =================================
// WARP PIPE - SINCRONIZAÇÃO
// =================================


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

    // Atualiza durante a rolagem
    window.addEventListener("scroll", atualizarCano);

    // Atualiza ao redimensionar a janela
    window.addEventListener("resize", atualizarCano);

    // Espera a imagem carregar
    if (cano.complete) {
        atualizarCano();
    } else {
        cano.addEventListener("load", atualizarCano);
    }

    // Atualiza depois que o navegador terminar de renderizar
    requestAnimationFrame(atualizarCano);

    console.log("Warp Pipe inicializada!");
}

// =================================
// CATÁLOGO DE PERSONAGENS
// =================================


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



// =================================
// SELETOR DE PERSONAGENS
// =================================

function configurarSeletorPersonagens() {

    const botoes = document.querySelectorAll(".personagem-btn");

    const imagem = document.getElementById("imagem-personagem");
    const categoria = document.getElementById("categoria-personagem");
    const nome = document.getElementById("nome-personagem");
    const descricao = document.getElementById("descricao-personagem");

    botoes.forEach(botao => {

        botao.addEventListener("click", function() {

            const personagemSelecionado = this.dataset.personagem;

            const dados = personagens[personagemSelecionado];

            if (!dados) return;

            // Atualiza as informações
            imagem.src = dados.imagem;
            imagem.alt = dados.nome;

            categoria.textContent = dados.categoria;
            nome.textContent = dados.nome;
            descricao.textContent = dados.descricao;

            // Atualiza o botão ativo
            botoes.forEach(botao => {
                botao.classList.remove("ativo");
            });

            this.classList.add("ativo");

        });

    });

}

// Executar o carregamento

carregarSecoes()
    .then(() => {
        configurarSeletorPersonagens();
        configurarWarpScroll();
    })
    .catch((erro) => {
        console.error("Erro ao montar o museu:", erro);
    });

