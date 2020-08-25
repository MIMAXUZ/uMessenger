import express from "express";
import socket from "socket.io";
import { getRepository } from "typeorm";

// import { User } from "../entity/User";
import { validationResult, Result, ValidationError } from "express-validator";
import { Chat } from "../entity/Chat";
import { ChatMessages } from "../entity/ChatMessages";

class ChatController {
    io: socket.Server;

    constructor( io: socket.Server ) {
        this.io = io;
    }

    /**
     * List all stored chat
     * @param req 
     * @param res 
     */


    /**
     *  Creating a new chat
     * @param req 
     * @param res 
     */
    create = async ( req: express.Request, res: express.Response ): Promise<void> => {
        const id = res.locals.user.id;

        const data = {
            author: id,
            partner: req.body.partner,
        };
        const errors: Result<ValidationError> = validationResult( req );

        if ( !errors.isEmpty() ) {
            res.status( 422 ).json( { errors: errors.array() } );
        }
        const chatRepository = getRepository( Chat );
        let chat: Chat;
        try {
            chat = await chatRepository.findOne( {
                where: {
                    author: data.author,
                    partner: data.partner
                }
            } );
            if ( !chat ) {
                const chat = await chatRepository.create( data );
                await chatRepository
                    .save( chat )
                    .then( async ( obj: Chat ) => {
                        const msgs: any = new ChatMessages();
                        msgs.user = id;
                        msgs.chat = obj.id;
                        msgs.message = req.body.message;

                        const messageRepository = getRepository( ChatMessages );
                        //const message = await messageRepository.create( msgData );
                        await messageRepository
                            .save( msgs )
                            .then( async ( msg: ChatMessages ) => {
                                const resultData = await getRepository( Chat )
                                    .createQueryBuilder( "chats" )
                                    .leftJoinAndSelect( "chats.author", "author" )
                                    .leftJoinAndSelect( "chats.partner", "partner" )
                                    .leftJoinAndSelect( "chats.messages", "chat_messages" )
                                    .getOne();
                                // Return response
                                res.status( 200 ).json( {
                                    status: "Success",
                                    chat: resultData,
                                } );
                                // Emit Socket
                                this.io.emit( 'SERVER:CHAT_CREATED', {
                                    ...data,
                                    chat: resultData,
                                } );
                            } )
                            .catch( ( reason ) => {
                                res.status( 500 ).json( {
                                    status: "error",
                                    message: reason,
                                } );
                            } );
                    } )
                    .catch( ( reason ) => {
                        res.status( 500 ).json( {
                            status: "error",
                            message: reason,
                        } );
                    } );
            }
        } catch ( error ) {
            res.status( 401 ).send( error );
        }
    };

    /**
     * Remove current chat
     * @param req 
     * @param res 
     */

    delete = async ( req: express.Request, res: express.Response ): Promise<void> => {

        // get id from url
        const id = req.params.id;
        const userId = res.locals.user.id;
        
        const chatRepository = getRepository( Chat );
        let chat: Chat;
        try {
            chat = await chatRepository.findOneOrFail({
                where: [
                    {
                        id: id,
                    },
                    {
                        author: userId,
                        partner: userId,
                    },
                ]
            })
            if (!chat) {
                res.status( 404 ).json( {
                    status: 'error',
                    message: 'Chat not found'
                } )
            }
            chatRepository.delete( id );
            // after all send a 204 - no content but accepted response
            res.status( 201 ).json( {
                status: 'success',
                message: 'Chat removed successfully'
            } )
        } catch ( e ) {
            res.status( 403 ).json( {
                status: 'error',
                message: e.message,
            } )
        }
    };

    /**
     * Send message for a chat
     * @param req 
     * @param res 
     */

    send_message = async ( req: express.Request, res: express.Response ): Promise<void> => {
        const userId = res.locals.user.id;

        const data = {
            message: req.body.message,
            user: userId,
            chat: req.body.chat_id,
        };
        const errors: Result<ValidationError> = validationResult( req );

        if ( !errors.isEmpty() ) {
            res.status( 422 ).json( { errors: errors.array() } );
        }
        const chatRepository = getRepository( Chat );
        let chat: Chat;
        try {
            chat = await chatRepository.findOne( {
                where: {
                    id: data.chat,
                }
            } );
            if (!chat) {
                res.status( 404 ).json( {
                    status: "error",
                    message: "Chat not found, Please create a chat first!",
                } );
            }

            const msgs: any = new ChatMessages();
            msgs.user = data.user;
            msgs.chat = data.chat;
            msgs.message = data.message;

            const messageRepository = getRepository( ChatMessages );
            //const message = await messageRepository.create( msgData );
            await messageRepository
                .save( msgs )
                .then( async ( msg: ChatMessages ) => {
                    const resultData = await getRepository( Chat )
                        .createQueryBuilder( "chats" )
                        .leftJoinAndSelect( "chats.author", "author" )
                        .leftJoinAndSelect( "chats.partner", "partner" )
                        .leftJoinAndSelect( "chats.messages", "messages")
                        .leftJoinAndSelect( "messages.user", "user", "user.id = :UserId", { UserId: data.user } )

                        .getOne();

                    // Return response
                    res.status( 200 ).json( {
                        status: "Success",
                        chat: resultData,
                        msg: msg,
                    } );
                    // Emit Socket
                    this.io.emit( 'SERVER:NEW_MESSAGE', {
                        ...data,
                        chat: resultData,
                    } );
                } )
                .catch( ( reason ) => {
                    res.status( 500 ).json( {
                        status: "error",
                        message: reason,
                    } );
                } );

        } catch ( error ) {
            res.status( 401 ).send( error );
        }
    };

    /**
     * Remove current chat
     * @param req 
     * @param res 
     */

    delete_message = async ( req: express.Request, res: express.Response ): Promise<void> => {

        // get id from url
        const id = req.params.id;
        const userId = res.locals.user.id;

        const messageRepository = getRepository( ChatMessages );
        let message: ChatMessages;
        try {
            message = await messageRepository.findOneOrFail( {
                where: [
                    {
                        id: id,
                    },
                    {
                        user: userId,
                    },
                ]
            } )
            if ( !message ) {
                res.status( 404 ).json( {
                    status: 'error',
                    message: 'Message not found'
                } )
            }
            messageRepository.delete( id );
            // after all send a 204 - no content but accepted response
            res.status( 201 ).json( {
                status: 'success',
                message: 'Message removed successfully'
            } )
        } catch ( e ) {
            res.status( 403 ).json( {
                status: 'error',
                message: e.message,
            } )
        }
    };

}
export default ChatController;
