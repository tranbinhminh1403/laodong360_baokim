import express from "express";
import { AppDataSource } from "./config/data-source";
import orderRoutes from "./routes/order.routes";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Thêm routes
app.use('/api/v1/orders', orderRoutes);

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error initializing TypeORM:", error);
    });

