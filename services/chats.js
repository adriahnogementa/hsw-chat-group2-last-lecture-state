exports.createChat = async function(targetUser_Id,session, db) {

    const chatExist = await db('Chat')
            .where({fromUser_id: targetUser_Id, toUser_id: session.idUser})
            .orWhere({toUser_id: targetUser_Id, fromUser_id: session.idUser})
                .first('idChat');

        if(chatExist) return chatExist;

        const created = await db('Chat').insert({

            toUser_id: targetUser_Id,
            fromUser_id:session.idUser
        }).returning('idChat');

        return created[0];

}

exports.getMessages = async function(chat_Id, db){

    const messages = await db('Message')
    .where({chat_id: chat_Id})
    .orderBy('sentAt').desc();

    return messages;

}

exports.writeMessage = async function(content,session,db){

        await db('Message')
        .insert({
            content,
            sentAt:Date.now(),
            user_id:session.idUser,
            chat_id:session.idChat
        });
}