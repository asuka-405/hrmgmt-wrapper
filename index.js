import cookieParser from "cookie-parser"
import express from "express"
import auth from "./authV1.js"
import jwt from "./helpers/auth.js"
import core from "./helpers/coreWrapper.js"
import manager from "./manageV1.js"
import middleware from "./middleware.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use("/", auth)
app.use("/manage", manager)

app.get("/", (req, res) => {
  res.redirect("/login")
})

app.listen(3000, () => {
  console.log("Listening: http://localhost:3000")
})
