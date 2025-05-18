import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Sube un archivo (imagen, video, audio) a qu.ax
 * Soporta mimetypes:
 * - image/jpeg
 * - image/jpg
 * - image/png
 * - video/mp4
 * - video/webm
 * - audio/mpeg
 * - audio/wav
 * 
 * @param {Buffer} buffer Buffer del archivo
 * @returns {Promise<string>} URL del archivo subido
 */
export default async function uploadToQuAx(buffer) {
  // Obtiene extensión y mime del buffer
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  if (!ext || !mime) throw new Error('No se pudo determinar el tipo de archivo');

  // Crea formulario y Blob para enviar el archivo
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append('files[]', blob, 'tmp.' + ext);

  // Hace el POST al endpoint de qu.ax
  const res = await fetch('https://qu.ax/upload.php', {
    method: 'POST',
    body: form,
  });

  // Parsea la respuesta JSON
  const result = await res.json();

  // Verifica éxito y retorna URL o lanza error
  if (result && result.success && result.files && result.files.length > 0) {
    return result.files[0].url;
  } else {
    throw new Error('Falló la subida del archivo a qu.ax');
  }
}