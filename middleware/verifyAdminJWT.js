const jwt = require("jsonwebtoken")

const verifyAdminJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorised" })
  const token = authHeader.split(" ")[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" })
    req.user = decoded.UserInfo.username
    req.roles = decoded.UserInfo.roles
    const allowed = ["Admin", "Manager"]
    if (allowed.some((v) => req.roles.includes(v))) next()
    else return res.status(403).json({ message: "Forbidden" })
  })
}

module.exports = verifyAdminJWT
