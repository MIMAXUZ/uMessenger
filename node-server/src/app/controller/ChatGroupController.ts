import express from "express";
import socket from "socket.io";
import { getRepository } from "typeorm";

// import { User } from "../entity/User";
import { validationResult, Result, ValidationError } from "express-validator";
import { Group } from "../entity/Group";

class ChatGroupController {
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
            owner: id,
            name: req.body.name,
            memberss: id,
            // url: req.body.url,
            description: req.body.description,
            // is_private: req.body.is_private,
        };
        const errors: Result<ValidationError> = validationResult( req );

        if ( !errors.isEmpty() ) {
            res.status( 422 ).json( { 
                status: "error",
                errors: errors.array() 
            } );
        }
        const groupRepository = getRepository( Group );
        try {
            const group = await groupRepository.create( data );
                await groupRepository
                    .save( group )
                    .then( async ( obj: Group ) => {
                        // const resultData = await getRepository( Chat )
                        //     .createQueryBuilder( "chats" )
                        //     .leftJoinAndSelect( "chats.author", "author" )
                        //     .leftJoinAndSelect( "chats.partner", "partner" )
                        //     .leftJoinAndSelect( "chats.messages", "chat_messages" )
                        //     .getOne();
                        // Return response
                        res.status( 200 ).json( {
                            status: "Success",
                            group: obj,
                        } );
                        // Emit Socket
                        this.io.emit( 'SERVER:GROUP_CREATED', {
                            ...data,
                            group: obj,
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
     * Users can join group
     * @param req 
     * @param res 
     */

    join_group = async ( req: express.Request, res: express.Response ): Promise<void> => {
        const id = res.locals.user.id;
        const groupURL = req.params.url;

        const errors: Result<ValidationError> = validationResult( req );

        if ( !errors.isEmpty() ) {
            res.status( 422 ).json( { errors: errors.array() } );
        }
        const groupRepository = getRepository( Group );
        let group: Group;
        console.log(groupURL);
        
        try {
            group = await groupRepository.findOne( {
                where: {
                    url: groupURL,
                    //is_active: 1
                }
            } );
            if ( !group ) {
                res.status( 404 ).json( {
                    status: "error",
                    message: "Group not found or already removed",
                } );
            }
         
            group.members = [id];

            await groupRepository
                .save( group )
                .then( async ( msg: Group ) => {
                    // Return response
                    res.status( 201 ).json( {
                        status: "Success",
                        data: msg,
                    } );
                    // Emit Socket
                    this.io.emit( 'SERVER:NEW_MEMBER', {
                        ...group,
                        data: msg,
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

    delete = async ( req: express.Request, res: express.Response ): Promise<void> => {

        // get id from url
        const id = req.params.id;
       // const userId = res.locals.user.id;

        const groupRepository = getRepository( Group );
        let group: Group;
        try {
            group = await groupRepository.findOneOrFail( {
                where: 
                    {
                        id: id,
                       // owner: userId,
                    }
            } )
            if ( !group ) {
                res.status( 404 ).json( {
                    status: 'error',
                    message: 'Group not found'
                } )
            }
            groupRepository.delete( id );
            // after all send a 204 - no content but accepted response
            res.status( 201 ).json( {
                status: 'success',
                message: 'Group removed successfully'
            } )
        } catch ( e ) {
            res.status( 403 ).json( {
                status: 'error',
                message: e.message,
            } )
        }
    };
}
export default ChatGroupController;
