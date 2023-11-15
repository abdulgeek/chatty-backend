let onlineUsers: any = [];
export default function (socket: any, io: any) {
    //user joins or opens the application
    socket.on("join", (user: any) => {
        socket.join(user);
        //add joined user to online users
        if (!onlineUsers.some((u: any) => u.userId === user)) {
            onlineUsers.push({ userId: user, socketId: socket.id });
        }
        //send online users to frontend
        io.emit("get-online-users", onlineUsers);
        //send socket id
        io.emit("setup socket", socket.id);
    });

    //socket disconnect
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user: any) => user.socketId !== socket.id);
        io.emit("get-online-users", onlineUsers);
    });

    //join a conversation room
    socket.on("join conversation", (conversation: any) => {
        socket.join(conversation);
    });

    //send and receive message
    socket.on("send message", (message: any) => {
        const conversation = message.conversation;
        if (!conversation.users) return;
        conversation.users.forEach((user: any) => {
            if (user._id === message.sender._id) return;
            socket.in(user._id).emit("receive message", message);
        });
    });

    //typing
    socket.on("typing", (conversation: any) => {
        socket.in(conversation).emit("typing", conversation);
    });

    socket.on("stop typing", (conversation: any) => {
        socket.in(conversation).emit("stop typing");
    });

    //call
    //---call user
    socket.on("call user", (data: any) => {
        const userId = data.userToCall;
        const userSocketId = onlineUsers.find((user: any) => user.userId == userId);
        io.to(userSocketId.socketId).emit("call user", {
            signal: data.signal,
            from: data.from,
            name: data.name,
            picture: data.picture,
        });
    });
    //---answer call
    socket.on("answer call", (data: any) => {
        io.to(data.to).emit("call accepted", data.signal);
    });

    //---end call
    socket.on("end call", (id: any) => {
        io.to(id).emit("end call");
    });
}
