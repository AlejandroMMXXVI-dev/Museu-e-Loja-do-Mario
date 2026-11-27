// Baixa capas e detalhes da RAWG UMA VEZ e salva tudo dentro do projeto.
// Depois disso o site não chama mais a RAWG no navegador (funciona atrás de firewall).
// Rode numa rede sem bloqueio (casa, 4G, GitHub Actions):  npm run dados
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const raiz = path.join(__dirname, "..");
// Permite rodar fora do projeto (ex.: Termux): CATALOGO = caminho do catalogo.js, SAIDA = pasta de saída.
const saidaRaiz = process.env.SAIDA || raiz;

// Chave: variável de ambiente ou .env
let chave = process.env.RAWG_KEY || "";
const envArq = path.join(raiz, ".env");
if (!chave && fs.existsSync(envArq)) {
    const m = fs.readFileSync(envArq, "utf8").match(/^\s*RAWG_KEY\s*=\s*["']?([^"'\r\n]+)/m);
    if (m) chave = m[1].trim();
}
if (!chave) { console.error("Faltou RAWG_KEY (.env ou variável de ambiente)."); process.exit(1); }

// Lê o catálogo de js/catalogo.js.
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(process.env.CATALOGO || path.join(raiz, "js", "catalogo.js"), "utf8"), ctx);
const nomes = ctx.window.CATALOGO.map(j => j.nome);

const API = "https://api.rawg.io/api";
const pasta = path.join(saidaRaiz, "images", "rawg");
fs.mkdirSync(pasta, { recursive: true });

async function api(caminho) {
    const r = await fetch(API + caminho + (caminho.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(chave));
    if (!r.ok) throw new Error("HTTP " + r.status + " em " + caminho.split("?")[0]);
    return r.json();
}

const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function baixar(url, destino) {
    if (!url) return null;
    const ext = (url.split("?")[0].match(/\.(jpe?g|png|webp)$/i) || [".jpg"])[0];
    const rel = "images/rawg/" + destino + ext;
    const abs = path.join(saidaRaiz, rel);
    if (!fs.existsSync(abs)) {
        const r = await fetch(url);
        if (!r.ok) return null;
        fs.writeFileSync(abs, Buffer.from(await r.arrayBuffer()));
    }
    return rel;
}

const nomesDe = lista => (lista || []).map(x => x.name);

(async () => {
    const saida = { fotos: {}, detalhes: {} };

    for (const nome of nomes) {
        try {
            const achados = await api("/games?search=" + encodeURIComponent(nome) + "&search_precise=true&page_size=1");
            const jogo = achados.results && achados.results[0];
            if (!jogo) { console.warn("Não achei:", nome); continue; }

            const [d, s] = await Promise.all([api("/games/" + jogo.id), api("/games/" + jogo.id + "/screenshots")]);
            const id = slug(nome);

            const foto = await baixar(d.background_image || jogo.background_image, id);
            const shots = [];
            for (const [i, x] of ((s.results || []).slice(0, 8)).entries()) {
                const local = await baixar(x.image, id + "-" + (i + 1));
                if (local) shots.push(local);
            }

            saida.fotos[nome] = { foto };
            saida.detalhes[nome] = {
                descricao: d.description_raw || "",
                lancamento: d.released || "",
                generos: nomesDe(d.genres),
                desenvolvedoras: nomesDe(d.developers),
                publicadoras: nomesDe(d.publishers),
                plataformas: (d.platforms || []).map(p => p.platform.name),
                metacritic: d.metacritic || null,
                foto,
                screenshots: shots
            };
            console.log("OK  ", nome);
        } catch (e) {
            console.warn("FALHOU", nome, "-", e.message);
        }
    }

    fs.mkdirSync(path.join(saidaRaiz, "js"), { recursive: true });
    fs.writeFileSync(
        path.join(saidaRaiz, "js", "dados-rawg.js"),
        "// Gerado por scripts/baixar-rawg.js (npm run dados).\nwindow.RAWG_DADOS = " + JSON.stringify(saida, null, 2) + ";\n"
    );
    console.log("\njs/dados-rawg.js gerado com", Object.keys(saida.detalhes).length, "jogos.");
})();
