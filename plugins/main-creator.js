let handler = async (m, { conn }) => {
  let vcard = `BEGIN:VCARD
VERSION:3.0
N:;Wirk;;;
FN:Wirk
ORG:
TEL;type=CELL;waid=50493732693:50493732693
END:VCARD`;
  
  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Wirk',
      contacts: [{ vcard }]
    }
  }, { quoted: m });
};

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;