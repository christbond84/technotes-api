const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const asyncHandler = require("express-async-handler")

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" })
  }
  const foundUser = await User.findOne({ username }).exec()
  if (!foundUser) {
    res.status(401).json({ message: "Unauthorised" })
  }
  const match = await bcrypt.compare(password, foundUser.password)
  if (!match) {
    res.status(401).json({ message: "Unauthorised" })
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  )
  const refreshToken = jwt.sign(
    { username: foundUser.username, roles: foundUser.roles },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  )

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ accessToken })
})

const refresh = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt)
    return res.status(401).json({ message: "Unauthoriseddddddd" })
  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" })
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec()
      if (!foundUser) return res.status(401).json({ message: "Unauthorised" })
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decoded.username,
            roles: decoded.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      )
      res.json({ accessToken })
    })
  )
}
const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204)
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true })
  res.json({ message: "Cookie cleared" })
}

module.exports = { login, refresh, logout }
