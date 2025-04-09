require('dotenv').config()
const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();
httpServer.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running on",process.env.PORT);
});

const io = new Server(httpServer, {
  cors: {
    origin: "https://talkyy.netlify.app", 
    methods: ["GET", "POST"],
    credentials: true
  }
  
});



const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on('connection', (socket) => {
  console.log(socket.id)
  socket.on('join-room',data => {
    const {name,email,roomNo} = data
    const send = {name,id:socket.id}
    console.log(roomNo)
    emailToSocketMap.set(data.email,socket.id)
    emailToSocketMap.set(socket.id,data.email)
    io.to(roomNo).emit('user-joined',(send))
    socket.join(roomNo)
    io.to(socket.id).emit('join-room',data)
  })
    // console.log('a user connected',socket.id);


    socket.on('user-call',({to,offer})=>{
      io.to(to).emit('incoming-call',{from : socket.id,offer})
    }) 

    socket.on('call-accepted',({to,ans})=>{
      io.to(to).emit('call-accepted',{from : socket.id,ans})
    })

    socket.on('peer-nego-needed',({to,offer})=>{
      io.to(to).emit('peer-nego-needed',{from:socket.id,offer})
    })

    socket.on('peer-nego-done',({to,ans})=>{
      io.to(to).emit('peer-nego-final',{from:socket.id,ans})
    })
    
  });

