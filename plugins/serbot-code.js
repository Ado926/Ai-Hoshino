/*⚠ PROHIBIDO EDITAR ⚠
Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion
*/

/* Importaciones */
import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeWASocket } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import fs from "fs";
import path from "path";
import ws from "ws";
import { fileURLToPath } from "url";

const { CONNECTING, CLOSED } = ws;

/* Utilidades */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toSansSerifPlain(text) {
  const plainMap = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
    0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫",
  };
  return text.split('').map(c => plainMap[c] || c).join('');
}

/* Mensajes de instrucciones */
const mensajeQR = `🌸🍃 ${toSansSerifPlain('Michi Ai Bot')} 🍃🌸

🌱 ${toSansSerifPlain('Conexion Sub-Bot Modo QR')}

✰ ${toSansSerifPlain('Con otro celular o en la PC escanea este QR para convertirte en un Sub-Bot Temporal.')} 🌿

\`1\` » ${toSansSerifPlain('Haga clic en los tres puntos en la esquina superior derecha')}
\`2\` » ${toSansSerifPlain('Toque dispositivos vinculados')}
\`3\` » ${toSansSerifPlain('Escanee este codigo QR para iniciar sesion con el bot')}

✧ ${toSansSerifPlain('¡Este código QR expira en 45 segundos!.')} 🌸`;

/* Array global para conexiones activas */
if (!global.conns) global.conns = [];

/* Función para crear el Sub-Bot */
export async function yukiJadiBot({ pathYukiJadiBot, m, conn, args, usedPrefix, command }) {
  try {
    // Obtener versión de baileys (la última)
    const { version, isLatest } = await fetchLatestBaileysVersion();

    // Crear estado de autenticación en la carpeta del sub-bot
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot);

    // Crear conexión socket
    const socket = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      logger: null,
      // caching and signal store puede ser opcional
    });

    socket.ev.on('connection.update', (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        // Enviar QR al usuario (por ejemplo, texto QR o imagen)
        conn.sendMessage(m.chat, { text: mensajeQR }, { quoted: m });
        // Opcional: enviar QR como imagen (usando qrcode)
        qrcode.toDataURL(qr, (err, url) => {
          if (!err) {
            conn.sendMessage(m.chat, {
              image: { url },
              caption: 'Escanea este QR para conectar el Sub-Bot'
            }, { quoted: m });
          }
        });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode || 'Desconocido';
        if (reason === DisconnectReason.loggedOut) {
          conn.sendMessage(m.chat, { text: 'El Sub-Bot fue desconectado (cerraste sesión).' }, { quoted: m });
        } else {
          conn.sendMessage(m.chat, { text: `Conexion del Sub-Bot cerrada. Razón: ${reason}` }, { quoted: m });
        }
        // Eliminar de conexiones activas
        global.conns = global.conns.filter(c => c !== socket);
      } else if (connection === 'open') {
        conn.sendMessage(m.chat, { text: 'Sub-Bot conectado correctamente!' }, { quoted: m });
      }
    });

    socket.ev.on('creds.update', saveCreds);

    // Guardar esta conexión para control global
    global.conns.push(socket);

  } catch (e) {
    console.error('Error creando Sub-Bot:', e);
    conn.sendMessage(m.chat, { text: `Error creando Sub-Bot: ${e.message}` }, { quoted: m });
  }
}

/* Función handler para comandos qr y code */
let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db) global.db = { data: { users: {} } };
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { Subs: 0 };

  let cooldownTime = 120000; // 2 minutos cooldown
  let lastSubs = global.db.data.users[m.sender].Subs || 0;
  let now = Date.now();

  if (now - lastSubs < cooldownTime) {
    let wait = ((cooldownTime - (now - lastSubs)) / 1000).toFixed(0);
    return conn.reply(m.chat, `⏳ Debes esperar ${wait} segundos para volver a vincular un Sub-Bot.`, m);
  }

  // Limitar máximo sub-bots activos
  let activeSubBots = global.conns.filter(c => c.user && c.ws && c.ws.readyState !== CLOSED);
  if (activeSubBots.length >= 20) {
    return m.reply(`❌ No hay espacios disponibles para Sub-Bots.`);
  }

  // Preparar carpeta para este sub-bot
  let userId = m.sender.split('@')[0];
  let pathYukiJadiBot = path.join('./jadi/', userId);
  if (!fs.existsSync(pathYukiJadiBot)) fs.mkdirSync(pathYukiJadiBot, { recursive: true });

  // Ejecutar función para crear sub-bot
  await yukiJadiBot({ pathYukiJadiBot, m, conn, args, usedPrefix, command });

  // Actualizar tiempo de subscripción para cooldown
  global.db.data.users[m.sender].Subs = now;
};

handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];

export default handler;

/* Función auxiliar para mostrar tiempo en texto (opcional) */
function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  let result = '';
  if (hours > 0) result += hours + 'h ';
  if (minutes > 0) result += minutes + 'm ';
  if (seconds > 0) result += seconds + 's';
  return result.trim();
}
