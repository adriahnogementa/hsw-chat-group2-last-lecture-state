const chatService = require('../services/chats');


module.exports = async function (router) {
    router.post('/api/chats', async function (req, res) {
  
        const result = await chatService.createChat(
            req.body.targetUser_id,
            req.session,
            req.app.get('db')
        );
  
        res.json({ ok: true });
    });

    router.get('/api/chats/:id/messages', async function (req, res) {

        const messages = await chatService.getMessages(
        req.params.id,
        req.app.get('db')
        );

        res.json(messages);
    });

    router.post('/api/chats/:id/messages', async function (req, res) {
        
        await chatService.writeMessage(
            req.body.content,
            req.params.id,
            
        );
        res.json({ ok: true });
    });

    router.delete('/api/chats/:id/messages', async function (req, res) {
        res.json({ ok: true });
    });
};
