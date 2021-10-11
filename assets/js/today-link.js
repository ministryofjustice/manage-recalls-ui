window.TodayLink = function (options = {}) {
  this.options = options
  if (!this.options.dateInputName) {
    console.log('todayLink could not initialise - dateInputName option not supplied')
    return
  }
  this.container = $(`[data-id="${this.options.dateInputName}Container"]`)
  if (!this.container.length) {
    console.log(`todayLink could not initialise - ${this.options.dateInputName}Container could not be found in DOM`)
    return
  }
  if (this.container.hasClass('today-link--initialised')) {
    return
  }
  this.button = $(`[data-id="${this.options.dateInputName}Button"]`)
  if (!this.button.length) {
    console.log(`todayLink could not initialise - ${this.options.dateInputName}Button could not be found in DOM`)
    return
  }

  this.day = $(`[name="${this.options.dateInputName}Day"]`)
  this.month = $(`[name="${this.options.dateInputName}Month"]`)
  this.year = $(`[name="${this.options.dateInputName}Year"]`)
  if (!this.day.length || !this.month.length || !this.year.length) {
    console.log(
      `todayLink could not initialise - one of the inputs named ${this.options.dateInputName}Day, ${this.options.dateInputName}Month or ${this.options.dateInputName}Year could not be found in DOM`
    )
    return
  }
  this.button.on('click', $.proxy(this, 'onButtonClick'))
  this.container.addClass('today-link--initialised')
  this.container.attr('aria-hidden', false)
  this.button.prop('disabled', false)
}

window.TodayLink.prototype.onButtonClick = function () {
  const today = new Date()
  this.day.val(today.getDate())
  this.month.val(today.getMonth() + 1)
  this.year.val(today.getFullYear())
}
