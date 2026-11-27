#!/data/data/com.termux/files/usr/bin/bash
# Baixa capas, screenshots e descrições da RAWG pelo celular (Termux).
# Uso:  bash baixar.sh
set -e
cd "$(dirname "$0")"

echo "== Instalando o que precisa (só na 1ª vez) =="
pkg update -y >/dev/null 2>&1 || true
pkg install -y nodejs zip >/dev/null

if [ ! -d "$HOME/storage/downloads" ]; then
    echo "Autorize o acesso ao armazenamento na janela que vai abrir..."
    termux-setup-storage
    sleep 5
fi

KEY="${RAWG_KEY:-}"
if [ -z "$KEY" ] && [ -f chave.txt ]; then KEY="$(tr -d '[:space:]' < chave.txt)"; fi
if [ -z "$KEY" ]; then
    read -r -p "Cole sua chave da RAWG: " KEY
    echo "$KEY" > chave.txt
fi

rm -rf saida
echo "== Baixando (pode levar alguns minutos) =="
RAWG_KEY="$KEY" CATALOGO="$PWD/catalogo.js" SAIDA="$PWD/saida" node baixar-rawg.js

DESTINO="$HOME/storage/downloads/dados-rawg.zip"
rm -f "$DESTINO"
(cd saida && zip -qr "$DESTINO" js images)

echo
echo "Pronto! Arquivo: Downloads/dados-rawg.zip"
echo "No PC, extraia esse zip DENTRO da pasta do projeto (ele junta js/ e images/)."
