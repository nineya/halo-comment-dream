class Emoji {
  constructor(name, fileName) {
    this.name = name
    this.fileName = fileName
  }
}

const defaultEmoji = [
  new Emoji('呵呵', 'hehe'),
  new Emoji('哈哈', 'haha'),
  new Emoji('吐舌', 'tushe'),
  new Emoji('啊', 'a'),
  new Emoji('酷', 'ku'),
  new Emoji('怒', 'nu'),
  new Emoji('开心', 'kaixin'),
  new Emoji('汗', 'han'),
  new Emoji('泪', 'lei'),
  new Emoji('黑线', 'heixian'),
  new Emoji('鄙视', 'bishi'),
  new Emoji('不高兴', 'bugaoxing'),
  new Emoji('真棒', 'zhenbang'),
  new Emoji('钱', 'qian'),
  new Emoji('疑问', 'yiwen'),
  new Emoji('阴险', 'yingxiang'),
  new Emoji('吐', 'tu'),
  new Emoji('咦', 'yi'),
  new Emoji('委屈', 'weiqu'),
  new Emoji('花心', 'huaxin'),
  new Emoji('呼~', 'hu'),
  new Emoji('笑眼', 'xiaoyan'),
  new Emoji('冷', 'len'),
  new Emoji('太开心', 'taikaixin'),
  new Emoji('滑稽', 'huaji'),
  new Emoji('勉强', 'mianqiang'),
  new Emoji('狂汗', 'kuanhan'),
  new Emoji('乖', 'guai'),
  new Emoji('睡觉', 'shuijiao'),
  new Emoji('惊哭', 'jingku'),
  new Emoji('生气', 'shengqi'),
  new Emoji('惊讶', 'jingya'),
  new Emoji('喷', 'pen')
]

export default [...defaultEmoji]
