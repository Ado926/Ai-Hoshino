let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false

  switch (type) {
    case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (!m.isGroup && !isOwner) {
        global.dfail('group', m, conn)
        throw false
      } else if (m.isGroup && !isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.bienvenida = isEnable
      break

    case 'autoread':
    case 'autoleer':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['autoread'] = isEnable
      break

    case 'document':
    case 'documento':
      isUser = true
      user.useDocument = isEnable
      break

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiLink = isEnable
      break

    case 'nsfw':
    case 'modohorny':
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.nsfw = isEnable
      break

    case 'antiarabes':
    case 'antinegros':
      if (m.isGroup && !(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.onlyLatinos = isEnable
      break

    case 'antiprivado':
    case 'antiprivate':
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      bot.antiPrivate = isEnable
      break

    default:
      if (!/[01]/.test(command)) return m.reply(`
*🚩 Ingresa una opción para habilitar o deshabilitar*

*≡ Lista de opciones disponibles:*
— *welcome* ➤ Activa bienvenida/grupo
— *nsfw* ➤ Activa comandos NSFW
— *antilink* ➤ Activa anti-links en grupos
— *antiarabes* ➤ Activa anti-no latinos
— *autoread* ➤ Auto leer mensajes
— *document* ➤ Descargar en documentos
— *antiprivado* ➤ Bloquea mensajes privados al bot

*• Ejemplo:* 
> ${usedPrefix + command} antiprivado
`.trim())
      throw false
  }

  m.reply(`La función *${type}* fue *${isEnable ? 'activada' : 'desactivada'}* ${isAll ? 'globalmente' : isUser ? 'para ti' : 'en este chat'}`)
}

handler.help = ['enable', 'disable']
handler.tags = ['nable']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler
