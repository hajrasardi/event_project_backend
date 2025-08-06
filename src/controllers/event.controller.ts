// // controllers/event.controller.ts
// import { Request, Response, NextFunction } from "express";
// import { prisma } from "../config/prisma";
// import AppError from "../errors/AppError";

// class EventController {
//   // Landing Page: list of upcoming events
//   async getUpcomingEvents(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { search, category, city } = req.query;

//       const events = await prisma.movie.findMany({
//         where: {
//           movieStatus: "PUBLISHED",
//           ...(search && { title: { contains: String(search), mode: "insensitive" } }),
//           ...(category && { category: String(category) }),
//           screenings: {
//             some: { startTime: { gte: new Date() }, ...(city && { cinema: { city: String(city) } }) },
//           },
//         },
//         include: {
//           screenings: {
//             where: { startTime: { gte: new Date() } },
//             include: { cinema: true, ticketTypes: true },
//           },
//         },
//         orderBy: { createdAt: "desc" },
//       });

//       res.status(200).send({ success: true, data: events });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Event Detail
//   async getEventDetail(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { slug } = req.params;
//       const event = await prisma.movie.findUnique({
//         where: { slug },
//         include: {
//           screenings: { include: { cinema: true, ticketTypes: true } },
//           reviews: { include: { user: true } },
//         },
//       });
//       if (!event) throw new AppError("Event not found", 404);

//       res.status(200).send({ success: true, data: event });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // Event Creation (Organizer)
//   async createEvent(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { title, poster, synopsis, category, screenings } = req.body;

//       const event = await prisma.movie.create({
//         data: {
//           title,
//           poster,
//           synopsis,
//           category,
//           slug: title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
//           movieStatus: "PUBLISHED",
//           screenings: {
//             create: screenings.map((s: any) => ({
//               startTime: new Date(s.startTime),
//               endTime: new Date(s.endTime),
//               cinemaId: s.cinemaId,
//               totalSeats: s.totalSeats,
//               availableSeats: s.totalSeats,
//               ticketTypes: { create: s.ticketTypes },
//             })),
//           },
//         },
//         include: { screenings: { include: { ticketTypes: true } } },
//       });

//       res.status(201).send({ success: true, message: "Event created", data: event });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// export default new EventController();
