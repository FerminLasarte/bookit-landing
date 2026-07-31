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

  const { name, email, user_type, whatsapp } = req.body;

  try {
    // 1. Guardar el lead en Supabase
    const { error: dbError } = await supabase
      .from('waitlist_leads')
      .insert([{ name, email, user_type, whatsapp }]);

    // Si el correo ya existe, Supabase dará error (por la regla UNIQUE que pusimos)
    if (dbError) {
      if (dbError.code === '23505') {
        return res.status(400).json({ error: 'Este correo ya está en la lista VIP.' });
      }
      throw dbError;
    }

    // 2. Enviar el correo de bienvenida con Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Bookit VIP <hola@somosbookit.com.ar>', // Cambia "auth" por el correo que inventaste
      to: email,
      subject: '¡Tus 500 puntos Bookit están asegurados! 🎁',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D78A1D;">¡Adentro, ${name}! 🎉</h2>
          <p>Ya estás oficialmente en la lista VIP de <strong>Bookit</strong>.</p>
          <p>Acabamos de guardar tus <strong>500 puntos bajo llave</strong>. Te vamos a avisar antes que a nadie cuando la app esté lista para descargar en Tandil para que puedas canjearlos en tu primer turno.</p>
          <p>Mientras tanto, seguinos en Instagram para enterarte de qué locales ya se están sumando.</p>
          <br/>
          <a href="https://instagram.com/somosbookit" style="background-color: #D78A1D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver novedades en Instagram</a>
          <br/><br/>
          <p>Nos vemos pronto,<br/>El equipo de Bookit.</p>
        </div>
      `
    });

    if (emailError) throw emailError;

    // 3. Responder éxito al frontend
    res.status(200).json({ success: true, message: '¡Registro exitoso!' });

  } catch (error) {
    console.error('Error en waitlist:', error);
    res.status(500).json({ error: 'Hubo un error al procesar tu solicitud. Intentá de nuevo.' });
  }
}