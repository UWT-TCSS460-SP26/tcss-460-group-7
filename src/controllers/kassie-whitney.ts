import { Request, Response } from 'express';

export const getGreeting = (request: Request, response: Response) => {
  interface Student {
    name: string;
    age: number;
    grade: string | number;
    school: string;
  }

  const user: Student = {
    name: 'Kassie Whitney',
    age: 33,
    grade: 'Senior',
    school: 'University of Washington Tacoma',
  };

  const greeting: string = `Hello! My name is ${user.name}. I am ${user.age} years old. I am currently a ${user.grade} at ${user.school}! It is nice to meet everyone!`;

  response.status(200).json({
    message: greeting,
  });
};
