import { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, PHONENUMBER_MCC } from '@whiskeysockets/baileys';
import pino from 'pino';
import { join } from 'path';
import fs from 'fs';

const __dirname = process.cwd();

export async function handler(conn, m, { args, usedPrefix, command }) {
  if (!args[0]) throw `*Ejemplo de uso:*\n\n${usedPrefix + command} 5219999999999`;

  const cleanedNumber = args[0].replace(/[^0-9]/g, '');
  if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
    throw `*El número debe tener el código del país, por ejemplo:* ${usedPrefix + command} 5219999999999`;
  }

  const authFolderB = `${Date.now()}`;
  const path = join(__dirname, 'serbot', authFolderB);
  const { state, saveCreds } = await useMultiFileAuthState(path);

  const { version } = await fetchLatestBaileysVersion();
  const conn2 = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    }
  });

  conn2.ev.on('creds.update', saveCreds);

  conn.reply(m.chat, '⏳ Iniciando sesión, espera un momento...', m);

  try {
    console.log('Solicitando código de emparejamiento...');
    let codeBot = await conn2.requestPairingCode(cleanedNumber);
    if (!codeBot) throw new Error('No se pudo obtener el código.');
    await m.reply(`✅ Código generado exitosamente:\n\n*${codeBot}*\n\nEste código es válido por 1 minuto.`);
  } catch (e) {
    console.error('Error al generar código:', e);
    return m.reply(`❌ Error al generar el código:\n${e.message}`);
  }

  // Espera hasta que el usuario complete el emparejamiento o se agote el tiempo
  const timeoutId = setTimeout(() => {
    if (!conn2.user) {
      try { conn2.ws.close(); } catch {}
      conn2.ev.removeAllListeners();
      fs.rmSync(`./serbot/${authFolderB}`, { recursive: true, force: true });
      conn.reply(m.chat, '⏳ Tiempo agotado. No se completó la vinculación.');
    }
  }, 60000); // 60 segundos

  conn2.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      clearTimeout(timeoutId);
      global.conns.push(conn2);
      conn.reply(m.chat, '✅ Bot vinculado correctamente.');
    }

    if (connection === 'close') {
      let reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Conexión cerrada con código:', reason);
    }
  });
}

global.handler = handler;
handler.command = ['jadibotcode', 'serbotcode', 'jadibotcodigo'];
handler.rowner = true;
