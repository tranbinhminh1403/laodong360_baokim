import express from "express";
import { AppDataSource } from "./config/data-source";
// import routes from "./routes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())
// app.use("/api/v1/mbank", routes);

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error initializing TypeORM:", error);
    });

