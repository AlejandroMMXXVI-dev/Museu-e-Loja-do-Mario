# 🍄 Museu e Loja do Mario

Site temático (front-end puro, sem banco de dados) que reúne um pequeno **museu interativo** sobre o universo do Mario e a entrada para uma **loja**. O visual imita o jogo: azul, amarelo, vermelho e verde, fonte *Titan One*, moedas, cogumelos e estrelas.

## Páginas e seções

| Página / seção | O que tem |
|---|---|
| `index.html` | Página inicial, carrega as seções abaixo via JavaScript |
| **História** (`secao01`) | Abertura "Nintendo apresenta: História do Mario" |
| **Personagens** (`secao02`) | Galeria interativa: seletor de personagens (Mario, Luigi, Peach, Yoshi, Bowser, etc.) com painel de informações e animações |
| **Loja** (`secao03`) | Blocos misteriosos que revelam itens e botão para a vitrine |
| `loja.html` | Vitrine demonstrativa com busca, categorias, ordenação e carrinho local (sem checkout/API) |
| `login.html` | Login e cadastro lado a lado (apenas visual, sem envio nem armazenamento de dados) |

## Destaques

- Navbar com menu de perfil animado e destaque da seção atual ao rolar
- Barra de rolagem personalizada com o cano do Mario
- Efeitos de partículas, moedas saltantes, parallax e revelação ao rolar
- Transição entre páginas em formato de íris
- Respeita `prefers-reduced-motion` e é responsivo para celular

## Estrutura

```
├── index.html
├── login.html           # login + cadastro (visual)
├── html_museu/          # seções carregadas na home
├── css/
│   ├── style.css        # estilos gerais, navbar e seções
│   ├── login.css        # estilos da página de login/cadastro
│   └── loja.css         # estilos da vitrine e do carrinho
├── js/
│   ├── navbar.js        # navbar, efeitos (MarioFX) e transições
│   ├── script.js        # seções, personagens e blocos misteriosos
│   ├── login.js         # validação visual dos formulários
│   └── loja.js          # catálogo demonstrativo, filtros e carrinho local
├── images/              # personagens e itens
└── assets/              # fonte Titan One e ícones
```

## Como executar

As seções são carregadas com `fetch`, então é preciso abrir por um servidor local (abrir o arquivo direto no navegador não funciona na home):

- **VS Code:** extensão *Live Server* (porta 5501 já configurada) → "Go Live"
- **Terminal:** `python3 -m http.server 5501` e acesse `http://localhost:5501`

## Tecnologias

HTML5 · CSS3 · JavaScript (vanilla)

---

*Projeto fan-made e sem fins comerciais. Mario e personagens são marcas da Nintendo.*
s