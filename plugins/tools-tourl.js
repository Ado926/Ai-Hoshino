import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) return conn.reply(m.chat, `⚠️ *Responde a una imagen o video para subirlo.*`, m)

  await m.react("⏳")

  try {
    let media = await q.download()
    let isImage = /image\/(png|jpe?g|gif)/i.test(mime)
    let isVideo = /video\/mp4/i.test(mime)

    if (!isImage && !isVideo) {
      await m.react("⚠️")
      return m.reply(`❌ *Tipo de archivo no compatible.* Solo se aceptan imágenes y videos .mp4`)
    }

    let link = await (isImage ? uploadImage : uploadFile)(media)
    if (!link) throw new Error('Fallo al subir archivo.')

    let size = formatBytes(media.length)
    let short = await shortUrl(link)

    let txt = `📎 *L I N K  D E S C A R G A* 📎\n\n`
    txt += `🔗 *Enlace:* ${link}\n`
    txt += `🧩 *Acortado:* ${short}\n`
    txt += `📦 *Tamaño:* ${size}\n`
    txt += `⏳ *Expira:* ${isImage ? 'No expira' : 'Desconocido'}\n\n`
    txt += `👤 *Generado por:* ${botname}`

    await conn.sendMessage(m.chat, { image: isImage ? media : null, caption: txt }, { quoted: m })
    await m.react("✅")

  } catch (err) {
    console.error(err)
    await m.react("❌")
    m.reply(`⚠️ *Ocurrió un error al subir el archivo.*`)
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
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
  return await res.text()
}