const mongoose=require('mongoose')
const Document=require("./Document")
const io=require('socket.io')(3001,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST'],
    },
})
mongoose.connect('mongodb://localhost/collaborative-document',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//When a client requests a document, the server fetches it from the database or creates a new one if it doesn’t exist.
const defaultValue=""
//When a new client connects, it listens for document requests.
io.on('connection',socket=>{
    socket.on('get-document',async documentId=>{
        const document=await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.data);
        socket.on('send-changes',delta=>{
            socket.broadcast.to(documentId).emit('receive-changes',delta);
        })
        //Periodically saves the document data to MongoDB.
        socket.on("save-document",async data=>{
await Document.findByIdAndUpdate(documentId,{data})
        })
    })
})

//Finds an existing document or creates a new one in MongoDB.
async function findOrCreateDocument(id){
    if(id==null)return

    const document=await Document.findById(id)
    if(document)return document
    return await Document.create({_id: id,data:defaultValue})
}