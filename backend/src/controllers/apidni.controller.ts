import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

export const consultarDNI = async (req: Request, res: Response): Promise<void> => {
    const { dni } = req.params;
    if (!dni) {
     res.status(400).json({ error: 'Número de DNI no proporcionado' });
     return;
    }

    // Token de autenticación proporcionado por la API
    const API_KEY = 'YX6xrS9emeD3b51rgzTCMo7avtrGNvFtss1zkIAMvu73RZO6RbI723KHutyyf6AA';

    try {
        const response = await axios.get(`https://api.apis.net.pe/v1/dni?numero=${dni}`);

        // Devuelve los datos de la respuesta de la API
        res.json(response.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                res.status(axiosError.response.status).json({ error: axiosError.response.data });
            } else {
                // Error de red o el servidor no respondió
                res.status(500).json({ error: 'Error de red o el servidor no respondió' });
            }
        } else {
            // Otro tipo de error
            res.status(500).json({ error: 'Error desconocido' });
        }
    }
};