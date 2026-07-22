const axios = require('axios')
const env = require('../config/env')
const User = require('../models/userModel')
const AppError = require('../utils/errors')
const { signToken } = require('../utils/jwt')
const { success } = require('../utils/response')

async function login(req, res) {
  const { code, nickname, avatarUrl, phone, account, password } = req.body

  if (account || password) {
    if (account !== 'admin' || password !== '123456') {
      throw new AppError('admin account or password is invalid', 401, 401)
    }

    const token = signToken({
      userId: 0,
      role: 'admin'
    })

    return success(res, {
      token,
      user: {
        id: 0,
        openid: 'admin',
        nickname: '管理员',
        role: 'admin'
      }
    })
  }

  if (!code) {
    throw new AppError('code is required', 400, 400)
  }
  if (!env.wechat.appid || !env.wechat.secret) {
    throw new AppError('wechat appid or secret is not configured', 500, 500)
  }

  const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      appid: env.wechat.appid,
      secret: env.wechat.secret,
      js_code: code,
      grant_type: 'authorization_code'
    },
    timeout: 8000
  })

  const data = response.data
  if (data.errcode) {
    throw new AppError(data.errmsg || 'wechat login failed', 400, data.errcode)
  }
  if (!data.openid || !data.session_key) {
    throw new AppError('wechat login response is invalid', 400, 400)
  }

  const user = await User.upsertWechatUser({
    openid: data.openid,
    unionid: data.unionid || null,
    sessionKey: data.session_key,
    nickname,
    avatarUrl,
    phone
  })

  const token = signToken({
    userId: user.id,
    openid: user.openid
  })

  return success(res, {
    token,
    user
  })
}

module.exports = {
  login
}
