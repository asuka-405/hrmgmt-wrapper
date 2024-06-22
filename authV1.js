import dotenv from "dotenv"
import { Router } from "express"
import { INVALID_USERNAME_ERROR, PASSWORD_COMPARE_FAILED } from "./constants.js"
import { default as helper, default as jwt } from "./helpers/auth.js"
import core from "./helpers/coreWrapper.js"
import middleware from "./middleware.js"

if (!process.env.PRODUCTION) {
  dotenv.config()
}

const auth = Router()

auth.get("/login", middleware.ifNoValidJWT, (req, res) => {
  res.render("login")
})

auth.get("/dashboard", middleware.ifValidJWT, async (req, res) => {
  const token = req.cookies.jwt
  const decoded = jwt.token.verifyJWT(token)
  const userdata = await core.find(decoded.username)
  res.render("dashboard", {
    ...userdata,
  })
})

auth.post("/logout", middleware.ifValidJWT, (req, res) => {
  res.clearCookie("jwt")
  res.redirect("/api/v1/auth/login")
})

auth.post("/api/v1/login", middleware.ifNoValidJWT, async (req, res) => {
  const { username, password } = req.body
  const user = await core.find(username)

  if (user === INVALID_USERNAME_ERROR)
    return res.status(401).json({
      message: "Invalid username",
    })
  if (
    core.comparePassword(password, user.password_hash) ===
    PASSWORD_COMPARE_FAILED
  )
    return res.status(401).json({
      message: "Invalid password",
    })

  const token = helper.token.generateJWT(username)
  res.cookie("jwt", token, {
    secure: process.env.PRODUCTION,
    sameSite: "strict",
  })
  res.redirect("/dashboard")
})

export default auth
