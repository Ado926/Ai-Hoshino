import fetch from 'node-fetch'

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*🚩 Escribe la URL de un repositorio de GitHub que deseas descargar.*`, m, adReply)
  }
  if (!regex.test(args[0])) {
    return conn.reply(m.chat, `Verifica que la *URL* sea de GitHub`, m, adReply).then(_ => m.react('✖️'))
  }
  const [_, user, repo] = args[0].match(regex) || []
  const sanitizedRepo = repo.replace(/.git$/, '')
  const repoUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}`
  const zipUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}/zipball`
  await m.react('🕓')
  try {
    const [repoResponse, zipResponse] = await Promise.all([
      fetch(repoUrl),
      fetch(zipUrl),
    ])
    const repoData = await repoResponse.json()
    const filename = zipResponse.headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
    const type = zipResponse.headers.get('content-type')
    const img = 'https://i.ibb.co/qsz2RZ4/images.jpg'
    let txt = `📓 *Nombre ∙* ${filename}\n`
       txt += `⚙️ *Repositorio ∙* ${user}/${sanitizedRepo}\n`
       txt += `👤 *Creador ∙* ${repoData.owner.login}\n`
       txt += `📝 *Descripción ∙* ${repoData.description || 'Sin descripción disponible'}\n`
       txt += `⛓ *Url ∙* ${args[0]}\n\n`
       txt += `*↻ Espera soy lenta. . .*`

await conn.reply(m.chat, txt, m, adReply)
await conn.sendFile(m.chat, await zipResponse.buffer(), filename, null, m)
await m.react('✅')
  } catch {
await conn.reply(m.chat,`*☓ Ocurrió un error inesperado*`, m, adReply).then(_ => m.react('✖️'))
  }
}
handler.help = ['gitclone <url git>']
handler.tags = ['downloader']
handler.command = /^(gitclone)$/i
handler.register = true 
handler.star = 1
export default handler