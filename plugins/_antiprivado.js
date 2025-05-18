export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return !0
  if (m.isGroup) return !1
  if (!m.message) return !0

  if (m.text?.toLowerCase().match(/piedra|papel|tijera|qr|code|serbot|jadibot/)) return !0

  let bot = global.db.data.settings[conn.user.jid] || {}
  if (bot.antiPrivate && !isOwner && !isROwner) {
    await m.reply(
      `[ ✰ ] Hola *@${m.sender.split`@`[0]}*, no está permitido escribir al privado del Bot. Serás bloqueado.\n\nÚnete al grupo oficial para usarla:\nhttps://chat.whatsapp.com/LVswMhDLIzbAf4WliK6nau`,
      false,
      { mentions: [m.sender] }
    )
    await conn.updateBlockStatus(m.chat, 'block')
  }
  return !1
}
