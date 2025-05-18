import fetch from 'node-fetch'

let handler  = async (m, { conn, usedPrefix, command }) => {
let img = await (await fetch(`https://files.catbox.moe/1utp85.jpg`)).buffer()
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
let txt = `*Hola!, te invito a unirte a los grupos oficiales del Bot para convivir con la comunidad :D*

1- 【 ✯ Michi Ai  ✰ 】
*✰* https://chat.whatsapp.com/LVswMhDLIzbAf4WliK6nau

*─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ*

➠ Enlaces anulados? entre aquí! 

Canal :
*✰* https://whatsapp.com/channel/0029Vb5UfTC4CrfeKSamhp1f

> [ ✰ ] ${global.textbot}`
await conn.sendFile(m.chat, img, "Thumbnail.jpg", txt, m, null, rcanal)
}
handler.help = ['grupos']
handler.tags = ['main']
handler.command = /^(grupos)$/i
export default handler 