class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      // domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      // domain: '.mqzcuyfbct.ap-northeast-1.awsapprunner.com',
      path: '/',
      // partitioned: true
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      // domain: process.env.NODE_ENV === 'production' ? '.newlean14.com' : 'localhost',
      // domain: '.mqzcuyfbct.ap-northeast-1.awsapprunner.com',
      path: '/',
      // partitioned: true
    })
  }
}

module.exports = new Cookie()
