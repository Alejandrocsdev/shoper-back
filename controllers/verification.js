class verificationController {
  sendOtp = async (req, res, next) => {
    const { loginKey } = req.body
    console.log(req.body)
    res.json({ message: `OTP from ${loginKey} send successfully.` })
  }
}

module.exports = new verificationController()
