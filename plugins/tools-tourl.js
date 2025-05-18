import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  
  if (!mime || !/image|video/.test(mime)) {
    return conn.reply(m.chat, '⚠️ Por favor, responde a una *imagen* o *video*.', m)
  }

  await m.react('🕐')

  try {
    let media = await q.download()
    let isImg = /image\/(png|jpe?g|gif)/.test(mime)
    let isVid = /video\/mp4/.test(mime)

    if (!isImg && !isVid) throw '⚠️ Solo se permiten imágenes o videos MP4.'

    let link = await (isImg ? uploadImage : uploadFile)(media)
    let short = await shortUrl(link)
    let size = formatBytes(media.length || 0)

    let caption = `📎 *L I N K  D E S C A R G A* 📎\n\n`
    caption += `🔗 *Enlace:* ${link}\n`
    caption += `🧩 *Acortado:* ${short}\n`
    caption += `📦 *Tamaño:* ${size}\n`
    caption += `⏳ *Expira:* ${isImg ? 'No expira' : 'Desconocido'}\n\n`
    caption += `👤 *Generado por:* ${global.botname || 'Bot'}`

    await conn.sendMessage(m.chat, { image: media, caption }, { quoted: m })
    await m.react('✅')
  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, '❌ Hubo un error al subir el archivo.', m)
    await m.react('❌')
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['tourl', 'upload']
handler.register = true

export default handler

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
  return await res.text()
}