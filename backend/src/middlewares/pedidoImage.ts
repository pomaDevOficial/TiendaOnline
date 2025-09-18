import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Crear directorio si no existe
const uploadDir = path.join(__dirname, "../../dist/uploads/comprobantes");
//const uploadDir = path.resolve(__dirname, "..", "..", "backend/dist/uploads");
console.log(uploadDir)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = uuidv4() + ext;
    cb(null, fileName);
  },
});

// Filtro de archivos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  }
};

export const PedidoImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: fileFilter,
});