import { 
    youtubedl,
    youtubedlv2
} from '@bochilteam/scraper'
import yts from 'yt-search'
import fetch from 'node-fetch' 
let limit = 300
let handler = async (m, { conn, args, isPrems, isOwner, text }) => {
if (!args || !args[0]) return conn.reply(m.chat, `*🚩 Escribe la URL de un video de YouTube que deseas descargar.*`, m, adReply)
  if (!args[0].match(/youtu/gi)) return conn.reply(m.chat,`Verifica que la *URL* sea de YouTube`, m, adReply).then(_ => m.react('✖️'))
  await m.react('🕓')
try {

  let q = '360p'
  let v = args[0]


let yt = await youtubedl(v).catch(async _ => await youtubedlv2(v))
let dl_url = await yt.video[q].download()
let ttl = await yt.title
let size = await yt.video[q].fileSizeH

let vid = (await yts(text)).all[0]

let { title, description, thumbnail, videoId, timestamp, views, ago, url } = vid
let ytestilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: `${title}`, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}

if (size.split('MB')[0] >= limit) return conn.reply(m.chat, `El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, adReply).then(_ => m.react('✖️'))

await conn.reply(m.chat, `🍭 *Título ∙* ${title}\n⚖️ *Tamaño ∙* ${size}\n\n*↻ Espera @${m.sender.split`@`[0]}, soy lenta. . .*`, ytestilo, adYT)

await conn.sendMessage(m.chat, { video: { url: dl_url }, fileName: `${vid.title}.mp4`, mimetype: 'video/mp4', caption: `${vid.title}\n⇆ㅤㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤㅤ↻\n00:15 ━━━━●────── ${vid.timestamp}`, thumbnail: await fetch(vid.thumbnail) }, { quoted: ytestilo })
await m.react('✅')
}catch(e){
conn.reply(m.chat,`*☓ Ocurrió un error inesperado*`, m, adReply).then(_ => m.react('✖️'))
console.log(e)}
}
handler.help = ['ytmp4 <url yt>']
handler.tags = ['downloader']
handler.command = /^(fgmp4|dlmp4|getvid|yt(v|mp4)?)$/i;
handler.star = 2
handler.register = true 
export default handler