let handler = async (m, { conn, usedPrefix, isOwner }) => {
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Wirkダーク;;\nFN:Irokz Dal ダーク\nORG:Wirk ダーク\nTITLE:\nitem1.TEL;waid=50493732693:50493732693\nitem1.X-ABLabel:Wirk ダーク⁩\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:Irokz Dal ダーク\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'Dev wirk ダーク⁩', contacts: [{ vcard }] }}, {quoted: m})
}
handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño'] 

export default handler
