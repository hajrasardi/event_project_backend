import { Request, Response, NextFunction } from "express";

export const organizerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Assuming `authMiddleware` has already attached user info to `req.user`
  // You would need to check the user's role here
  // if (req.user?.role !== 'ORGANIZER') {
  //   return res.status(403).json({ message: 'Forbidden: Organizers only.' });
  // }
  next();
};
