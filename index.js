import express from "express"
import mongoose from "mongoose"
import auth from "./authV1.js"

mongoose
    .connect("mongodb://localhost:27017/auth-server", {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("connected to db @ mongodb://localhost:27017/auth-server")
    })
    .catch((err) => {
        console.error(err)
    })
const app = express()

app.use(express.json())
app.use("/api/v1/auth", auth)

app.listen(3000, () => {
    console.log("Listening: https://localhost:3000")
})
