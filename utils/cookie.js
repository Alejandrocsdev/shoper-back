class Cookie {
  store(res, token) {
    console.log('cookie.store')
    console.log(process.env.NODE_ENV === 'production')
    console.log(process.env.NODE_ENV === 'production' ? 'https://newlean14.com' : 'localhost')
    return res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? 'https://newlean14.com' : 'localhost',
      path: '/'
    })
  }

  clear(res) {
    return res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? 'https://newlean14.com' : 'localhost',
      path: '/'
    })
  }
}

module.exports = new Cookie()
