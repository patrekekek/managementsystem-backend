require('dotenv').config();

const express = require("express");
// const cors = require("cors");
const mongoose = require("mongoose")

const userRoutes = require("./routes/userRoutes");



const app = express();

//Middlware
// app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

//ROutes

app.use("/api/users", userRoutes);



//mongoose connect

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Connected to Mongodb Atlas and listening to port", process.env.PORT)
        })
    })
    .catch((err) => console.error("Connection failed", err))

