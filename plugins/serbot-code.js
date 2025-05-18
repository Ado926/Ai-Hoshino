/*⚠ PROHIBIDO EDITAR ⚠
Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion
El codigo de este archivo esta inspirado en el codigo original de:
- Aiden_NotLogic >> https://github.com/ferhacks
*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*
El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino
Contenido adaptado por:
- GataNina-Li >> https://github.com/GataNina-Li
- elrebelde21 >> https://github.com/elrebelde21
*/

import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import util from "util";
import * as ws from "ws";
import { child, spawn, exec } from "child_process";
import { makeWASocket } from "../lib/simple.js";
import { fileURLToPath } from "url";

const { CONNECTING } = ws;

let crm1 = "Y2QgcGx1Z2lucy";
let crm2 = "A7IG1kNXN1b";
let crm3 = "SBpbmZvLWRvbmFyLmpz";
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz";

let drm1 = "";
let drm2 = "";

function toSansSerifPlain(text) {
  const plainMap = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
    0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫",
    á: "𝖺́", é: "𝖾́", í: "𝗂́", ó: "𝗈́", ú: "𝗎́", ñ: "𝗇̃",
    Á: "𝖠́", É: "𝖤́", Í: "𝖨́", Ó: "𝖮́", Ú: "𝖴́", Ñ: "𝖭̃",
    ü: "𝗎̈", Ü: "𝖴̈",
    ",": ",", ".": ".", "?": "?", "!": "!", ":": ":", ";": ";", "(": "(", ")": ")", "-": "-", "/": "/", "&": "&", "#": "#", "@": "@", "+": "+", "=": "=", "%": "%", "$": "$", "€": "€", '"': '"', "'": "'", "`": "`", "~": "~", "^": "^", "<": "<", ">": ">"
  };
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += plainMap[char] || char;
  }
  return result;
}

let rtx = `🌸🍃 ${toSansSerifPlain('Michi Ai Bot')} 🍃🌸

🌱 ${toSansSerifPlain('Conexion Sub-Bot Modo QR')}

✰ ${toSansSerifPlain('Con otro celular o en la PC escanea este QR para convertirte en un Sub-Bot Temporal.')} 🌿

\`1\` » ${toSansSerifPlain('Haga clic en los tres puntos en la esquina superior derecha')}
\`2\` » ${toSansSerifPlain('Toque dispositivos vinculados')}
\`3\` » ${toSansSerifPlain('Escanee este codigo QR para iniciar sesion con el bot')}

✧ ${toSansSerifPlain('¡Este código QR expira en 45 segundos!.')} 🌸`;

let rtx2 = `🌸🍃 ${toSansSerifPlain('Michi Ai Bot')} 🍃🌸

🌱 ${toSansSerifPlain('Conexion Sub-Bot Modo Code')}

✰ ${toSansSerifPlain('Usa este Código para convertirte en un Sub-Bot Temporal.')} 🌿

\`1\` » ${toSansSerifPlain('Haga clic en los tres puntos en la esquina superior derecha')}
\`2\` » ${toSansSerifPlain('Toque dispositivos vinculados')}
\`3\` » ${toSansSerifPlain('Selecciona Vincular con el número de teléfono')}
\`4\` » ${toSansSerifPlain('Escriba el Código para iniciar sesion con el bot')}

✧ ${toSansSerifPlain('No es recomendable usar tu cuenta principal.')} ✨`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yukiJBOptions = {};
if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  // if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`♡ Comando desactivado temporalmente.`)
  let time = global.db.data.users[m.sender].Subs + 120000;
  if (new Date() - global.db.data.users[m.sender].Subs < 120000) {
    return conn.reply(m.chat, `⏳ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m);
  }
  const subBots = [...new Set(global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED))];
  const subBotsCount = subBots.length;
  if (subBotsCount === 20) {
    return m.reply(`❌ No se han encontrado espacios para *Sub-Bots* disponibles.`);
  }
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let id = `${who.split`@`[0]}`;
  let pathYukiJadiBot = path.join(`./jadi/`, id);
  if (!fs.existsSync(pathYukiJadiBot)) {
    fs.mkdirSync(pathYukiJadiBot, { recursive: true });
  }
  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot;
  yukiJBOptions.m = m;
  yukiJBOptions.conn = conn;
  yukiJBOptions.args = args;
  yukiJBOptions.usedPrefix = usedPrefix;
  yukiJBOptions.command = command;
  yukiJBOptions.fromCommand = true;
  yukiJadiBot(yukiJBOptions);
  global.db.data.users[m.sender].Subs = new Date() * 1;
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];

export default handler;

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options;

  if (command === 'code') {
    command = 'qr';
    args.unshift('code');
  }

  const mcode = args[0] && /(--code|code)/.test(args
