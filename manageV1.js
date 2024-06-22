import express from "express"
import fs from "fs"
import multer from "multer"
import jwt from "./helpers/auth.js"
import core from "./helpers/coreWrapper.js"

const manager = express.Router()
export default manager

const upload = multer({ dest: "uploads/" })

manager.get("/", jwt.middleware.ifValidJWT, async (req, res) => {
  const username = jwt.token.verifyJWT(req.cookies.jwt).username
  const department = (await core.find(username)).department
  if (department == "HR") {
    return res.redirect("/manage/hr")
  }
  return res.redirect("/manage/self")
})

manager.get("/self", isHROrSelf, async (req, res) => {
  const token = req.cookies.jwt
  const decoded = jwt.token.verifyJWT(token)
  const userdata = await core.find(decoded.username)
  userdata.isHRInitiated = false
  res.render("selfManage", userdata)
})

manager.get("/hr", isHR, async (req, res) => {
  res.render("hrManage")
})

manager.get("/employees", isHR, async (req, res) => {
  const employees = await core.findAll()
  res.render("employees", { employees })
})

manager.get("/employee/new", isHR, async (req, res) => {
  const userdata = {
    email: "",
    phone: "",
    address: "",
    password_hash: "",
    username: "",
    department: "",
    name: "",
    dob: "",
    doh: "",
    salary: "",
    position: "",
    isHRInitiated: true,
    isNew: true,
  }

  res.render("selfManage", userdata)
})

manager.get("/employee/:username", isHR, async (req, res) => {
  const username = req.params.username
  const userdata = await core.find(username)
  userdata.isHRInitiated = true
  res.render("selfManage", userdata)
})

manager.put("/employee/hrtrigger", isHR, async (req, res) => {
  const username = req.params.username
  const userdata = await core.find(username)
  Object.assign(userdata, req.body)
  return await core
    .update(userdata)
    .then(() => res.json({ message: "Updated" }))
})

manager.get("/batch-upload", isHR, async (req, res) => {
  res.render("batchUpload")
})

manager.post("/batch-upload", isHR, upload.single("file"), async (req, res) => {
  const dlfPath = req.file.path
  let isSuccess = true
  const result = await core.batchCreate(dlfPath).catch((err) => {
    isSuccess = false
    return { error: err }
  })
  res.json(result)
  const username = jwt.token.verifyJWT(req.cookies.jwt).username
  fs.rename(
    dlfPath,
    `uploads/${username}-${Date.now()}-${isSuccess ? "success" : "failed"}.dlf`,
    (err) => {
      if (err) throw err
    }
  )
})

manager.post("/create", isHR, async (req, res) => {
  const userdata = req.body
  console.log(userdata)
  const result = await core.create(userdata)
  res.json(result)
})

manager.put("/update", isHROrSelf, async (req, res) => {
  const token = req.cookies.jwt
  const decoded = jwt.token.verifyJWT(token)
  const userdata = await core.find(decoded.username)
  Object.assign(userdata, req.body)
  return await core
    .update(userdata)
    .then(() => res.json({ message: "Updated" }))
})

export async function isHR(req, res, next) {
  const token = req.cookies.jwt
  const decoded = jwt.token.verifyJWT(token)
  const user = await core.find(decoded.username)
  if (user.department == "HR") return next()
  res.json({ error: "Unauthorized" })
}

export async function isHROrSelf(req, res, next) {
  const token = req.cookies.jwt
  const decoded = jwt.token.verifyJWT(token)
  const user = await core.find(decoded.username)
  if (user.department == "HR" || user.username == decoded.username)
    return next()
  res.json({ error: "Unauthorized" })
}
