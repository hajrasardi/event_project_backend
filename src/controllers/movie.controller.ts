import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import slugify from "slugify";

class MovieController {
  // 1. GET all movies
  public async getMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category } = req.query;

      const movies = await prisma.movie.findMany({
        where: {
          movieStatus: "PUBLISHED",
          ...(search && {
            title: { contains: String(search), mode: "insensitive" },
          }),
          ...(category && { category: String(category).toUpperCase() as any }),
        },
        orderBy: { createdAt: "desc" },
        include: { screenings: true },
      });

      res.status(200).send({ success: true, data: movies });
    } catch (error) {
      next(error);
    }
  }

  // 2. GET movie detail with screenings
  public async getMovieById(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          screenings: { include: { cinema: true, ticketTypes: true } },
        },
      });

      if (!movie) throw new AppError("Movie not found", 404);

      res.status(200).send({ success: true, data: movie });
    } catch (error) {
      next(error);
    }
  }

  // 3. CREATE movie
  public async createMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, synopsis, category, movieStatus } = req.body;

      const movie = await prisma.movie.create({
        data: {
          title,
          synopsis,
          slug: slugify(title, { lower: true }), // ✅ generate slug
          category: category.toUpperCase(), // ✅ ensure enum format
          movieStatus: movieStatus.toUpperCase(), // ✅ ensure enum format
        },
      });

      res
        .status(201)
        .send({ success: true, message: "Movie created", data: movie });
    } catch (error) {
      next(error);
    }
  }

  // 4. CREATE screening
  public async createScreening(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { movieId, cinemaId, startTime, endTime, totalSeats } = req.body;

      const screening = await prisma.screening.create({
        data: {
          movieId,
          cinemaId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          totalSeats,
          availableSeats: totalSeats, // ✅ Initialize here
        },
      });

      res
        .status(201)
        .send({ success: true, message: "Screening created", data: screening });
    } catch (error) {
      next(error);
    }
  }
}

export default MovieController;
