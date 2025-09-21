require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")

const leaveRoutes = require("./routes/leaveRoutes");
const userRoutes = require("./routes/userRoutes");



const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})


//ROutes

app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log("Connected to Mongodb Atlas and listening to port", process.env.PORT)
        })
    })
    .catch((err) => console.error("Connection failed", err))

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!"})
})