/* Busca capas e detalhes dos jogos na RAWG e guarda os resultados no navegador. */
(function () {
    "use strict";

    const RAWG_KEY = (window.ENV && window.ENV.RAWG_KEY) || "";
    const API = "https://api.rawg.io/api";
    const CHAVE_FOTOS = "mario_midia_cache";
    const CHAVE_DETALHES = "mario_detalhes_cache";

    const VAZIO = { foto: null };
    const pendentes = new Map(); // Reaproveita consultas que já estão em andamento.

    function temChave() {
        return !!RAWG_KEY && !RAWG_KEY.startsWith("COLE");
    }

    function lerCache(chave) {
        try { return JSON.parse(localStorage.getItem(chave) || "{}"); } catch (erro) { return {}; }
    }

    function salvarCache(chave, nome, dados) {
        try {
            const cache = lerCache(chave);
            cache[nome] = dados;
            localStorage.setItem(chave, JSON.stringify(cache));
        } catch (erro) { /* O cache não é essencial. */ }
    }

    // Se a rede/CORS bloquear a RAWG, para de insistir e o site segue sem as fotos.
    let apiBloqueada = false;

    async function pegar(caminho) {
        if (apiBloqueada) return null;
        try {
            const r = await fetch(API + caminho + (caminho.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(RAWG_KEY), { mode: "cors", credentials: "omit" });
            return r.ok ? await r.json() : null;
        } catch (erro) {
            apiBloqueada = true;
            console.warn("RAWG inacessível (bloqueio de rede/extensão ou fora do ar). O site continua sem as fotos da API.");
            return null;
        }
    }

    async function acharJogo(nome) {
        const achados = await pegar("/games?search=" + encodeURIComponent(nome) + "&search_precise=true&page_size=1");
        return (achados && achados.results && achados.results[0]) || null;
    }

    function buscar(nome) {

        const cache = lerCache(CHAVE_FOTOS);
        if (cache[nome]) return Promise.resolve(cache[nome]);
        if (!temChave()) return Promise.resolve(VAZIO);
        if (pendentes.has(nome)) return pendentes.get(nome);

        const promessa = acharJogo(nome)
            .then(jogo => {
                const dados = { foto: (jogo && jogo.background_image) || null };
                if (dados.foto) salvarCache(CHAVE_FOTOS, nome, dados);
                return dados;
            })
            .finally(() => pendentes.delete(nome));

        pendentes.set(nome, promessa);
        return promessa;
    }

    const nomes = (lista) => (lista || []).map(x => x.name);

    async function detalhes(nome) {

        if (!temChave()) return null;

        const cache = lerCache(CHAVE_DETALHES);
        if (cache[nome]) return cache[nome];

        const jogo = await acharJogo(nome);
        if (!jogo) return null;

        const [d, s] = await Promise.all([
            pegar("/games/" + jogo.id),
            pegar("/games/" + jogo.id + "/screenshots")
        ]);
        if (!d) return null;

        const resultado = {
            descricao: d.description_raw || "",
            lancamento: d.released || "",
            generos: nomes(d.genres),
            desenvolvedoras: nomes(d.developers),
            publicadoras: nomes(d.publishers),
            plataformas: (d.platforms || []).map(p => p.platform.name),
            metacritic: d.metacritic || null,
            foto: d.background_image || jogo.background_image || null,
            screenshots: ((s && s.results) || []).map(x => x.image).slice(0, 8)
        };

        salvarCache(CHAVE_DETALHES, nome, resultado);
        return resultado;
    }

    window.Midia = { buscar: buscar, detalhes: detalhes, temChave: temChave };
})();
