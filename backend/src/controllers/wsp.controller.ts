import { Request, Response } from 'express';
import axios from 'axios';

export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
  const { phone, message } = req.body;

  // Validación básica
  if (!phone || !message) {
    res.status(400).json({ error: 'Falta número o mensaje' });
    return;
  }

  // Validación de formato de número
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ error: 'Formato de número inválido. Usa formato internacional sin "+" ni espacios.' });
    return;
  }

  const url = "https://7105.api.greenapi.com/waInstance7105309578/sendMessage/13cf8fdf2a3348fa9e802e080eb072d7b42acc76c6964d1f90";

  const payload = {
  chatId: `${phone}@c.us`,
  message,
  customPreview: {
    title: "Mensaje desde tu app", // Puedes personalizarlo
    description: "probando"             // Opcional
  }
};


  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Mensaje enviado:', response.data);

    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);

    // Mostrar el error real de la API si está disponible
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};
