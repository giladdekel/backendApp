
require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");

const app = express();
const axios = require("axios");
const userRouter = require("./routers/userRouter");
var cors = require('cors')
// dotenv.config();

app.use(cors())


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(
  "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
);
console.log("Server Run");

// mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });


mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost/fullStackAppDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);



const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));





app.use("/api/users", userRouter);


//////////////////////////////////////////// socket.io server

// const http = require("http");

// const { Server } = require("socket.io");

// const httpServer = http.Server(app);
// const io = new Server(httpServer, { cors: { origin: "*" } });

// const path = require("path");

//////////

// io.on("connection", (socket) => {
//   console.log(
//     "///////////////////////connection///////////////////////",
//     socket.id
//   );

//   socket.on("muteVolume", () => {
//     // console.log("emit muteVolume");
//     io.local.emit("onVolumeMute");
//   });
// });

////////////////////////////////////////////

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


// httpServer.listen(5000, "0.0.0.0", function () {
//   console.log("listening on *:5000");
// });

// httpServer.listen(port, () => {
//   console.log(`Serve at http://localhost:${port}`);
// });

