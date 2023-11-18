// creatre a express server and do CRUD of user wiht name and email

import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express';
const prisma = new PrismaClient();

const app: Express = express();

app.use(express.json());

const sendResponse = (
  res: Response,
  status: number,
  message: string,
  data: object = []
) => {
  let dataTosend = {
    message,
  };

  if (data) {
    dataTosend = {
      ...dataTosend,
      ...data,
    };
  }
  return res.status(status).json(dataTosend);
};

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// create a user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    sendResponse(res, 201, 'User created successfully', { user });
  } catch (error: any) {
    sendResponse(res, 500, error.message, { error });
  }
});

// get all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    if (!users || users.length === 0) {
      return sendResponse(res, 404, 'No users found');
    }
    sendResponse(res, 200, 'Users fetched successfully', { users });
  } catch (error: any) {
    sendResponse(res, 500, 'Something went wrong', { error });
  }
});

// get a user
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }
    sendResponse(res, 200, 'User fetched successfully', { user });
  } catch (error: any) {
    sendResponse(res, 500, 'Something went wrong', { error });
  }
});

// update a user
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
      },
    });
    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }
    sendResponse(res, 200, 'User updated successfully', { user });
  } catch (error: any) {
    sendResponse(res, 500, 'Something went wrong', { error });
  }
});

// delete a user
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }
    sendResponse(res, 204, 'User deleted successfully', { user });
  } catch (error: any) {
    sendResponse(res, 500, 'Something went wrong', { error });
  }
});

app.listen(3000);

console.log('Listening on port 3000');
