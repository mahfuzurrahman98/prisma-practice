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
  data: object = {}
) => {
  let _response: { message: string; data?: object } = {
    message,
  };

  if (Object.keys(data).length > 0) {
    _response = {
      ..._response,
      data,
    };
  }
  return res.status(status).json(_response);
};

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// create a user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || name.trim().length === 0) {
      return sendResponse(res, 422, 'Name is required');
    }
    if (!email || email.trim().length === 0) {
      return sendResponse(res, 422, 'Email is required');
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) {
      return sendResponse(res, 409, 'User already exists');
    }
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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
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
      select: {
        id: true,
        name: true,
        email: true,
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
    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!existingUser) {
      return sendResponse(res, 404, 'User not found');
    }

    if (email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (userWithSameEmail && userWithSameEmail.id !== Number(id)) {
        return sendResponse(res, 422, 'Email already exists');
      }
    }

    // Update the user based on the provided data
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name || existingUser.name, // Update name if provided, otherwise keep the existing name
        email: email || existingUser.email, // Update email if provided, otherwise keep the existing email
      },
    });

    sendResponse(res, 200, 'User updated successfully', {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
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
