const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db")


//middleware
app.use(cors());
app.use(express.json());

//ROUTES
app.get("/api", (req,res) => {
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})


app.listen(5000, () => {
    console.log("server has started on port 5000")
});