import jwt from 'jsonwebtoken'

export const signToken = (userId, role, extra = {}) => {
  return jwt.sign(
    { id: userId, role, ...extra },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export const sendTokenResponse = (user, res) => {
  // Include municipalityId and contractorProfileId in the JWT
  const extra = {}
  if (user.municipalityId)      extra.municipalityId = user.municipalityId.toString()
  if (user.contractorProfileId) extra.contractorProfileId = user.contractorProfileId.toString()

  const token = signToken(user._id, user.role, extra)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  })
  return token
}
