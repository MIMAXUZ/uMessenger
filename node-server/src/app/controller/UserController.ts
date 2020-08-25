import express from "express";
import socket from "socket.io";

import { getConnection } from "typeorm";

import { User } from "../entity/User";
import { validationResult } from "express-validator";

//import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";

class UserController {
    io: socket.Server;

    constructor(io: socket.Server) {
        this.io = io;
    }

    /**
     * List all stored User
     * @param req 
     * @param res 
     */

   
    /**
     *  Creating User
     * @param req 
     * @param res 
     */
    create = async (req: express.Request, res: express.Response): Promise<void> => {
        
        // We'll create a new user by taking the information coming from the body.
        const postData: {
            email: string;
            last_name: string;
            first_name: string;
            password: string;
        } = {
            email: req.body.email,
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            password: req.body.password,
        };

        const errors = validationResult(req);

      if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
        } else {
          const userRep = await getConnection().getRepository(User);
          const user = await userRep.create(postData);
        
          await userRep
          .save(user)
              .then((obj: User) => {
                  res.status(200).json(obj);
              })
              .catch((reason) => {
                  if (reason.code = "ER_DUP_ENTRY") {
                      res.status(500).json({
                          status: "error",
                          message: "the email already exists. Please use another email for registration",
                      });
                  }
                  else {
                      res.status(500).json({
                          status: "error",
                          message: reason,
                      });
                  }
              });
        }
    };
}
export default UserController;
