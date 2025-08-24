import { Request, Response } from 'express';
import Marca from '../models/marca.model';  // Importamos el modelo Marca

// Crear una nueva marca
export const createMarca = async (req: Request, res: Response): Promise<void> => {
    const { nombre } = req.body;

    try {
        // Verificar si ya existe una marca con el mismo nombre
        const existingMarca = await Marca.findOne({ where: { nombre } });

        if (existingMarca) {
            res.status(400).json({ msg: 'Ya existe una marca con ese nombre' });
            return;
        }

        // Crear la nueva marca
        const nuevaMarca = await Marca.create({
            nombre
        });

        res.status(201).json(nuevaMarca);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};

// Obtener todas las marcas
export const getMarcas = async (req: Request, res: Response): Promise<void> => {
    try {
        const marcas = await Marca.findAll();
        res.json(marcas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las marcas' });
    }
};

// Obtener una marca por ID
export const getMarcaById = async (req: Request, res: Response): Promise<void> => {
    const { idMarca } = req.params;  // Extraemos id de los parámetros

    try {
        const marca = await Marca.findByPk(idMarca);  // Buscar marca por ID

        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }

        res.json(marca);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la marca' });
    }
};

// Actualizar una marca
export const updateMarca = async (req: Request, res: Response): Promise<void> => {
    const { idMarca } = req.params;  // Extraemos id de los parámetros
    const { nombre } = req.body;

    try {
        // Buscar marca por ID
        const marca: any = await Marca.findByPk(idMarca);

        if (!marca) {
            res.status(404).json({ msg: `No existe una marca con el id ${idMarca}` });
            return;
        }

        // Verificar si el nombre ya existe, excluyendo la marca actual
        const existingMarca = await Marca.findOne({ where: { nombre, id: { $ne: idMarca } } });

        if (existingMarca) {
            res.status(400).json({ msg: 'Ya existe una marca con ese nombre' });
            return;
        }

        // Actualizar los campos proporcionados
        if (nombre) marca.nombre = nombre;

        await marca.save();  // Guardar los cambios

        res.json({ msg: 'La marca fue actualizada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Ocurrió un error, comuníquese con soporte' });
    }
};

// Eliminar una marca
export const deleteMarca = async (req: Request, res: Response): Promise<void> => {
    const { idMarca } = req.params;  // Extraemos id de los parámetros

    try {
        // Buscar marca por ID
        const marca = await Marca.findByPk(idMarca);

        if (!marca) {
            res.status(404).json({ msg: 'Marca no encontrada' });
            return;
        }

        await marca.destroy();  // Eliminar la marca
        res.json({ msg: 'Marca eliminada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar la marca' });
    }
};
