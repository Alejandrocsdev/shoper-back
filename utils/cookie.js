class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      path: '/'
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      // httpOnly: true,
      // sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      path: '/'
    })
  }
}

module.exports = new Cookie()
