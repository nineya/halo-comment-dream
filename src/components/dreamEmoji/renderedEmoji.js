export function renderedEmojiHtml(html) {
  const emojiData = require('./emojis.js')['default']
  for (let emoji of emojiData) {
    let name = emoji.name
    let img = `<img class="dream-emoji" src="${process.env.BASE_URL}assets/emoji/${name}.png" alt="${emoji.description}"/>`
    html = html.replaceAll(`#(${name})`, img)
  }
  return html
}
