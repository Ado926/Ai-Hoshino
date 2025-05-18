import {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} from '@whiskeysockets/baileys';

import moment from 'moment-timezone';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from "qrcode";
import fs from "fs";
import pino from 'pino';
import * as ws from 'ws';
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';

if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn: star, args, usedPrefix, command }) => {
  let parent = args[0] === 'plz' ? _conn : await global.conn;
  if (!(args[0] === 'plz' || (await global.conn).user.jid === _conn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`);
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0];

    if (!fs.existsSync("./serbot/" + authFolderB)) {
      fs.mkdirSync("./serbot/" + authFolderB, { recursive: true });
    }

    if (args[0] && args[0] !== 'plz') {
      fs.writeFileSync(`./serbot/${authFolderB}/creds.json`,
        JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')
      );
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`);
    const msgRetryCounterCache = new NodeCache();
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: true,
      getMessage: async (key) => {
        let jid = jidNormalizedUser(key.remoteJid);
        let msg = await store.loadMessage(jid, key.id);
        return msg?.message || "";
      },
      version
    };

    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let isInit = true;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin } = update;

      if (isNewLogin) conn.isInit = true;

      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
      if (code && code !== DisconnectReason.loggedOut && !conn?.ws?.socket) {
        let i = global.conns.indexOf(conn);
        if (i >= 0) {
          delete global.conns[i];
          global.conns.splice(i, 1);
        }
        parent.sendMessage(m.chat, { text: "Conexión perdida..." }, { quoted: m });
      }

      if (connection === 'open') {
        conn.isInit = true;
        global.conns.push(conn);

        await parent.reply(m.chat,
          args[0]
            ? '✅ Conectado correctamente con credenciales'
            : '✅ Bot vinculado con éxito\n\nNota: esta conexión es temporal.\nSi el bot principal se reinicia, los sub bots también se desconectarán.',
          m);

        if (!args[0]) {
          await parent.reply(conn.user.jid, 'En la próxima conexión usa este código para evitar usar QR:', m);
          await parent.sendMessage(conn.user.jid, {
            text: usedPrefix + command + " " +
              Buffer.from(fs.readFileSync(`./serbot/${authFolderB}/creds.json`), "utf-8").toString("base64")
          }, { quoted: m });
        }
      }
    }

    const timeoutId = setTimeout(() => {
      if (!conn.user) {
        try { conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        let i = global.conns.indexOf(conn);
        if (i >= 0) {
          delete global.conns[i];
          global.conns.splice(i, 1);
        }
        fs.rmSync(`./serbot/${authFolderB}`, { recursive: true, force: true });
      }
    }, 30000);

    let handlerModule = await import('../handler.js');
    let creloadHandler = async (restartConn) => {
      try {
        let fresh = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(fresh || {}).length) handlerModule = fresh;
      } catch (e) {
        console.error(e);
      }

      if (restartConn) {
        try { conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
        isInit = true;
      }

      if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
      }

      conn.handler = handlerModule.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds;

      conn.ev.on('messages.upsert', conn.handler);
      conn.ev.on('connection.update', conn.connectionUpdate);
      conn.ev.on('creds.update', conn.credsUpdate);

      isInit = false;
      return true;
    };
    await creloadHandler(false);
  }

  serbot();
};

handler.help = ['code'];
handler.tags = ['serbot'];
handler.command = ['code', 'codebot'];
handler.rowner = true;

export default handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
