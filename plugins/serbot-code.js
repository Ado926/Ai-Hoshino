import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, useSingleFileAuthState } from "@adiwajshing/baileys";
import fs from "fs";
import path from "path";

export async function yukiJadiBot({ m, conn, args, usedPrefix, command }) {
  try {
    // Definir la carpeta para guardar el estado del sub-bot, por usuario
    let userId = m.sender.split("@")[0];
    let pathYukiJadiBot = path.join("./jadi", userId);

    // Crear la carpeta si no existe
    if (!fs.existsSync(pathYukiJadiBot)) {
      fs.mkdirSync(pathYukiJadiBot, { recursive: true });
    }

    // Obtener la última versión de baileys
    const { version } = await fetchLatestBaileysVersion();

    // Obtener el estado y la función para guardar credenciales
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot);

    // Crear el socket (sub-bot)
    let jadi = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      // Opcional: logger: pino({ level: 'silent' }),
      getMessage: async (key) => {
        // Puedes implementar la lógica para obtener mensajes si quieres
        return { conversation: "Mensaje no encontrado" };
      },
    });

    // Guardar credenciales cada vez que se actualizan
    jadi.ev.on("creds.update", saveCreds);

    // Manejar conexión
    jadi.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
        if (statusCode !== DisconnectReason.loggedOut) {
          console.log("Intentando reconectar Sub-Bot...");
          yukiJadiBot({ m, conn, args, usedPrefix, command }); // reconectar
        } else {
          console.log("Sub-Bot desconectado. Login requerido.");
        }
      } else if (connection === "open") {
        console.log("Sub-Bot conectado correctamente");
        conn.sendMessage(m.chat, { text: "Sub-Bot iniciado correctamente" }, { quoted: m });
      }
    });

    // Aquí puedes agregar eventos para el sub-bot (jadi)
    jadi.ev.on("messages.upsert", async ({ messages }) => {
      // Ejemplo simple: responder "Hola!" cuando alguien mande "hi"
      const msg = messages[0];
      if (!msg.message) return;
      if (msg.key.fromMe) return; // Ignorar mensajes propios

      const text = msg.message.conversation || "";
      if (text.toLowerCase() === "hi") {
        await jadi.sendMessage(msg.key.remoteJid, { text: "Hola desde el Sub-Bot!" });
      }
    });

    // Guardar la instancia para usarla fuera si quieres
    conn.jadi = jadi;

  } catch (e) {
    console.error("Error creando Sub-Bot:", e);
    conn.sendMessage(m.chat, { text: `Error creando Sub-Bot: ${e.message}` }, { quoted: m });
  }
}
