import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Inicializamos Resend y Supabase con las variables de entorno de Vercel
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Solo aceptamos peticiones POST (envío de formulario)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, user_type, whatsapp, category, consent } = req.body;

  // Validación básica de campos obligatorios
  if (!name || !email || !user_type) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'Es necesario aceptar recibir novedades para continuar.' });
  }

  if (user_type === 'local' && !category) {
    return res.status(400).json({ error: 'Contanos la categoría de tu comercio.' });
  }

  try {
    // 1. Guardar el lead en Supabase
    const { error: dbError } = await supabase
      .from('waitlist_leads')
      .insert([{
        name,
        email,
        user_type,
        whatsapp,
        category: user_type === 'local' ? category : null,
        consent
      }]);

    // Si el correo ya existe, Supabase dará error (por la regla UNIQUE que pusimos)
    if (dbError) {
      if (dbError.code === '23505') {
        return res.status(400).json({ error: 'Este correo ya está en la lista VIP.' });
      }
      throw dbError;
    }

    // 2. Enviar el correo de bienvenida con Resend (contenido distinto según tipo de usuario)
    const isLocal = user_type === 'local';

    const emailHtml = isLocal
      ? `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D78A1D;">¡Adentro, ${name}! 🎉</h2>
          <p>Tu local ya está oficialmente en la lista VIP de fundadores de <strong>Bookit</strong>.</p>
          <p>Vamos a contactarte por WhatsApp o email antes del lanzamiento en Tandil para contarte los detalles del <strong>precio fundador</strong>, con cupos limitados para los primeros locales que se sumen.</p>
          <p>Mientras tanto, seguinos en Instagram para enterarte de qué otros locales ya se están sumando.</p>
          <br/>
          <a href="https://instagram.com/bookit_arg" style="background-color: #D78A1D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver novedades en Instagram</a>
          <br/><br/>
          <p>Nos vemos pronto,<br/>El equipo de Bookit.</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D78A1D;">¡Adentro, ${name}! 🎉</h2>
          <p>Ya estás oficialmente en la lista VIP de <strong>Bookit</strong>.</p>
          <p>Acabamos de guardar tus <strong>500 puntos bajo llave</strong>. Te vamos a avisar antes que a nadie cuando la app esté lista para descargar en Tandil para que puedas canjearlos en tu primer turno.</p>
          <p>Mientras tanto, seguinos en Instagram para enterarte de qué locales ya se están sumando.</p>
          <br/>
          <a href="https://instagram.com/bookit_arg" style="background-color: #D78A1D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver novedades en Instagram</a>
          <br/><br/>
          <p>Nos vemos pronto,<br/>El equipo de Bookit.</p>
        </div>
      `;

    const { error: emailError } = await resend.emails.send({
      from: 'Bookit VIP <hola@somosbookit.com.ar>', // Cambia "auth" por el correo que inventaste
      to: email,
      subject: isLocal
        ? '¡Tu lugar como local fundador está reservado! 🎁'
        : '¡Tus 500 puntos Bookit están asegurados! 🎁',
      html: emailHtml
    });

    if (emailError) throw emailError;

    // 3. Responder éxito al frontend
    res.status(200).json({ success: true, message: '¡Registro exitoso!' });

  } catch (error) {
    console.error('Error en waitlist:', error);
    res.status(500).json({ error: 'Hubo un error al procesar tu solicitud. Intentá de nuevo.' });
  }
}