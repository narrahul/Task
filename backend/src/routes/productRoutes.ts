import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { ProductController } from "../controllers/productController";

const router = Router();
const productController = new ProductController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Stricter rate limit for product creation/update
const productModificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 product modifications per windowMs
  message: 'Too many product modifications from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Product routes - order matters! Specific routes before parameterized routes
router.get("/", (req, res) => { productController.getAllProducts(req, res); });
router.get("/skus/existing", (req, res) => { productController.getExistingSKUs(req, res); });
router.get("/:id", (req, res) => { productController.getProductById(req, res); });
router.post("/", productModificationLimiter, upload.array('images', 10), (req, res) => { productController.createProduct(req, res); });
router.put("/:id", productModificationLimiter, upload.array('images', 10), (req, res) => { productController.updateProduct(req, res); });
router.delete("/:id", productModificationLimiter, (req, res) => { productController.deleteProduct(req, res); });

export default router;