// 代码块语言识别

$(function () {
  $('pre').each(function () {
    var code_language = $(this).attr('class')
    if (!code_language) {
      var $figure = $(this).closest('figure.highlight')
      if ($figure.length) {
        code_language = $figure.attr('class')
      }
    }

    if (!code_language) return true

    var classes = code_language.split(/\s+/).filter(Boolean)
    var lang_name = null

    classes.forEach(function (c) {
      if (lang_name) return
      if (c.indexOf('language-') === 0) {
        lang_name = c.replace('language-', '').trim()
      }
    })

    if (!lang_name) {
      classes.forEach(function (c) {
        if (lang_name) return
        if (c === 'highlight' || c === 'line-numbers') return
        lang_name = c.trim()
      })
    }

    if (!lang_name) return true

    var $highlight_lang = $('<div class="code_lang" title="代码语言"></div>')
    $(this).after($highlight_lang)

    // 首字母大写
    lang_name = lang_name.slice(0, 1).toUpperCase() + lang_name.slice(1)
    $(this).siblings('.code_lang').text(lang_name)
  })
})
