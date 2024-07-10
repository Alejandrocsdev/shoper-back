class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      // domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      domain: '.shoper-front.onrender.com',
      path: '/'
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      // domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      domain: '.shoper-front.onrender.com',
      path: '/'
    })
  }
}

module.exports = new Cookie()
