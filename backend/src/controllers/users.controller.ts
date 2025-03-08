import { Request, Response } from "express-serve-static-core";
import { registerUser } from "../services/user.service";

export const getUsers = (request: Request, response: Response) => {
  response.send([]);
};

export const getUsersById = (request: Request, response: Response) => {
  response.send({});
};

export const createUser = async (request: Request, response: Response) => {
  try {
    const { firstName, lastName, email, password } = request.body;
    const user = await registerUser(firstName, lastName, email, password);

    response.status(201).json({
      message: "User registered successfully. Check your email for OTP",
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message });
    } else {
      response.status(400).json({ message: "An unknwn error occurred" });
    }
  }
};
