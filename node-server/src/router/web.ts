import bodyParser from "body-parser";
import express from "express";
import socket from "socket.io";

import { RegValidation, SignValidation } from "./../util";

import { UserCtrl, AuthCtrl, ChatCtrl, GrpCtrl } from "./../app/controller";

import { CheckAuth } from "./../app/middlewares";

import cors from "cors";

const createRoutes = ( app: express.Express, io: socket.Server ) => {

    const options: cors.CorsOptions = {
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
        credentials: true,
        methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
        origin: true,
        //origin: "*",
        optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
        preflightContinue: false
    };

    // declare controllers
    const UserController = new UserCtrl( io );
    const ChatController = new ChatCtrl( io );
    const GroupController = new GrpCtrl( io );
    // AuthCtrl
    const Auth = new AuthCtrl();

    app.use( cors() );
    //enable pre-flight
    app.options( "*", cors( options ) );

    //Load files via URL
    app.use( express.static( 'public' ) );
    app.use( CheckAuth );
    app.use( bodyParser.json() );

    app.get( "/", ( _: express.Request, res: express.Response ) => {
        res.send( "Hello, World!" );
    } );

    // API for Users CRUD
    app.post( "/user/register", RegValidation, UserController.create );
    app.post( "/user/login", SignValidation, Auth.login );
    app.post( "/user/change/password/", SignValidation, Auth.changePassword );
    app.post( "/user/logout", SignValidation, Auth.logout );

    // API for one to one chats
    app.post( "/chat/create", ChatController.create );
    app.delete( "/chat/:id", ChatController.delete );
    app.post( "/chat/message", ChatController.send_message );
    app.delete( "/chat/message/:id", ChatController.delete_message );

    // API for Groups
    app.post( "/group/create", GroupController.create );
    app.put( "/group/join/:url", GroupController.join_group );
    app.delete( "/group/:id", GroupController.delete );

};

export default createRoutes;
