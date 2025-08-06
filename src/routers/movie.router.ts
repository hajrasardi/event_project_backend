import { Router } from "express";
import MovieController from "../controllers/movie.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();
const movieController = new MovieController();

router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);

// Admin Only
router.post("/", verifyToken, movieController.createMovie);
router.post("/screening", verifyToken, movieController.createScreening);

export default router;
