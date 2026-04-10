import { Request, Response } from "express";

export const getGreeting = (_request: Request, response: Response) => {
    response.status(200).json({ message: 'Hello, my name is Duy-Hung Le and I\'m glad to meet you!' });
}