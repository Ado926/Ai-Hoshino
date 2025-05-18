let handler = async (m, { conn }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, '❗ Responde a una imagen o video.', m)

  let media = await q.download()
  try {
    let link = await uploadImage(media)
    return conn.reply(m.chat, `✅ Enlace generado:\n${link}`, m)
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Error al subir. ¿Seguro que es una imagen soportada?', m)
  }
}
handler.command = ['testurl']
export default handler