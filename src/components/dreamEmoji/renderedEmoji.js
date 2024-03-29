export function renderedEmojiHtml(html) {
  const emojiData = require('./emojis.js')['default']
  for (let emoji of emojiData) {
    let name = emoji.name
    let img = `<img class="dream-emoji" src="${process.env.BASE_URL}assets/emoji/${emoji.fileName}.png" alt="${name}"/>`
    html = html.replace(new RegExp(`\\[/${name}\\]`, 'gm'), img)
  }
  return html
}
