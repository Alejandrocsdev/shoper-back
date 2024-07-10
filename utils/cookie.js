class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      domain: '.onrender.com',
      path: '/',
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      domain: '.onrender.com',
      path: '/',
    })
  }
}

module.exports = new Cookie()
