// Lê o .env e gera js/env.js (usado pelo navegador).
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const arquivo = path.join(raiz, ".env");
const vars = {};

if (fs.existsSync(arquivo)) {
    fs.readFileSync(arquivo, "utf8").split(/\r?\n/).forEach(linha => {
        const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && !linha.trim().startsWith("#")) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
} else {
    console.warn("Aviso: .env não encontrado. Copie .env.example para .env e preencha a chave.");
}

const saida = "// Gerado por scripts/gerar-env.js — não edite nem commite.\nwindow.ENV = " +
    JSON.stringify({ RAWG_KEY: vars.RAWG_KEY || "" }, null, 4) + ";\n";

fs.writeFileSync(path.join(raiz, "js", "env.js"), saida);
console.log("js/env.js gerado.");
