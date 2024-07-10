class Cookie {
  store(res, token) {
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      domain: '.mqzcuyfbct.ap-northeast-1.awsapprunner.com',
      path: '/',
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      domain: '.mqzcuyfbct.ap-northeast-1.awsapprunner.com',
      path: '/',
    })
  }
}

module.exports = new Cookie()
