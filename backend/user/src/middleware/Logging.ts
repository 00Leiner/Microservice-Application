import { Request, Response, NextFunction } from 'express';
import Logging from '../utils/Logging';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log the request
  Logging.info(`Inbound -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on('finish', () => {
    // Log the response
    Logging.info(`Outbound -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
  });

  next();
};
