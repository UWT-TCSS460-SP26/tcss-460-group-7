import { Request, Response } from 'express';

export const getGreeting = (_req: Request, res: Response) => {
    const greeting: string = "Hello! My name is Skyler!";
    res.status(200).json({msg : greeting});
}


