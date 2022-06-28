/**
 * time ago
 * @param {*} time
 */
export function timeAgo(time) {
  const currentTime = new Date().getTime()
  const between = currentTime - time
  const days = Math.floor(between / (24 * 3600 * 1000))
  if (days === 0) {
    const leave1 = between % (24 * 3600 * 1000)
    const hours = Math.floor(leave1 / (3600 * 1000))
    if (hours === 0) {
      const leave2 = leave1 % (3600 * 1000)
      const minutes = Math.floor(leave2 / (60 * 1000))
      if (minutes === 0) {
        const leave3 = leave2 % (60 * 1000)
        const seconds = Math.round(leave3 / 1000)
        return seconds + ' 秒前'
      }
      return minutes + ' 分钟前'
    }
    return hours + ' 小时前'
  }
  if (days < 0) return '刚刚'
  if (days <= 7) {
    return days + ' 天前'
  } else {
    return formatDate(time, 'yyyy/MM/dd hh:mm')
  }
}

function formatDate(date, fmt) {
  date = new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}

// From <https://www.w3resource.com/javascript-exercises/javascript-regexp-exercise-9.php>
export function isUrl(str) {
  let regexp =
    /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
  return regexp.test(str)
}

export function isEmpty(content) {
  return content === null || content === undefined || content === ''
}

export function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object
}

export function validEmail(email) {
  const re = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z]{2,8}$/
  return re.test(email)
}

export function isQQMail(mail) {
  var re = /^[1-9][0-9]{4,9}@qq.com$/gim
  return !isEmpty(mail) && re.test(mail.trim())
}

export function isQQ(qq) {
  var re = /^[1-9][0-9]{4,9}$/gim
  return re.test(qq)
}

export function qqMailToQQ(mail) {
  return !isEmpty(mail) && mail.trim().substring(0, mail.lastIndexOf('@'))
}

export const queryStringify = query => {
  return Object.keys(query)
    .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
    .join('&')
}

export function getUrlKey(name) {
  return (
    decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || '')[1].replace(/\+/g, '%20')
    ) || null
  )
}

/**
 * 滚动到指定控件
 * @param element 需要被跳转到的控件
 * @param time 跳转时间
 * @param headingsOffset 控件距离页面顶部的距离
 * @param callback 跳转完成后执行的函数
 */
export function animateScroll(element, time, headingsOffset, callback) {
  let rect = element.getBoundingClientRect()
  let currentY = window.scrollY
  let targetY = currentY + rect.top - headingsOffset
  let speed = (targetY - currentY) / time
  let offset = currentY > targetY ? -1 : 1
  let requestId
  function step() {
    currentY += speed
    if (currentY * offset < targetY * offset) {
      window.scrollTo(0, currentY)
      requestId = window.requestAnimationFrame(step)
    } else {
      window.scrollTo(0, targetY)
      window.cancelAnimationFrame(requestId)
      callback && callback()
    }
  }
  window.requestAnimationFrame(step)
}

/**
 * 解码html文档编码
 * @param text
 * @param encode 是否需要支持html
 */
export function decodeHtml(text, encode) {
  if (!encode) {
    return text.replace(/&gt;(\s|&nbsp;)/g, '> ')
  }
  let elem = document.createElement('div')
  elem.innerHTML = text
  const html = elem.innerText || elem.textContent
  elem = null
  return html
}

/**
 * 编码html文档
 * @param html
 * @param encode 是否需要支持html
 */
export function encodeHtml(html, encode) {
  if (encode) {
    return html
  }
  return html.replace(/[<&"]/g, function (c) {
    return { '<': '&lt;', '&': '&amp;', '"': '&quot;' }[c]
  })
}
