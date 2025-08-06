import { prisma } from "../config/prisma";
import slugify from "slugify";
import { MovieStatus, MovieCategory } from "../../prisma/generated/client";

export class MovieService {
  // 1. Get upcoming movies
  async findUpcomingMovies() {
    return prisma.movie.findMany({
      where: {
        movieStatus: MovieStatus.PUBLISHED,
        screenings: {
          some: {
            startTime: { gte: new Date() },
          },
        },
      },
      include: {
        screenings: {
          include: { cinema: true, ticketTypes: true },
        },
      },
    });
  }

  // 2. Get movie detail by slug
  async findMovieBySlug(slug: string) {
    return prisma.movie.findUnique({
      where: { slug },
      include: {
        reviews: true,
        screenings: {
          include: { cinema: true, ticketTypes: true },
        },
      },
    });
  }

  // 3. Create movie with screenings and ticket types
  async createMovie(data: {
    title: string;
    poster?: string;
    synopsis?: string;
    category: MovieCategory;
    screenings: {
      startTime: Date;
      endTime: Date;
      cinemaId: number;
      ticketTypes: { name: string; price: number; quota: number }[];
    }[];
  }) {
    const slug = slugify(data.title, { lower: true, strict: true });

    return prisma.$transaction(async (tx) => {
      // Create movie
      const movie = await tx.movie.create({
        data: {
          title: data.title,
          slug,
          poster: data.poster,
          synopsis: data.synopsis,
          category: data.category,
          movieStatus: MovieStatus.PUBLISHED,
        },
      });

      // Create screenings
      for (const screeningData of data.screenings) {
        const totalSeats = screeningData.ticketTypes.reduce(
          (sum, tt) => sum + tt.quota,
          0
        );

        const screening = await tx.screening.create({
          data: {
            startTime: screeningData.startTime,
            endTime: screeningData.endTime,
            movieId: movie.id,
            cinemaId: screeningData.cinemaId,
            totalSeats,
            availableSeats: totalSeats,
            ticketTypes: {
              create: screeningData.ticketTypes.map((tt) => ({
                name: tt.name,
                price: tt.price,
                quota: tt.quota,
              })),
            },
          },
        });
      }

      return movie;
    });
  }
}
