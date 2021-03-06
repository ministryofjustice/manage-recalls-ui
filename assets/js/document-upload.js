if (MOJFrontend.dragAndDropSupported() && MOJFrontend.formDataSupported() && MOJFrontend.fileApiSupported()) {
  DocumentUpload = function (params) {
    this.defaultParams = {
      uploadFileEntryHook: $.noop,
      uploadFileExitHook: $.noop,
      uploadFileErrorHook: $.noop,
      uploadStatusText: 'Uploading files, please wait',
      dropzoneHintText: 'Drag and drop files here or',
      dropzoneButtonText: 'Choose files',
    }

    this.params = $.extend({}, this.defaultParams, params)

    this.params.container.addClass('moj-multi-file-upload--enhanced')

    this.feedbackContainer = this.params.container.find('.moj-multi-file__uploaded-files')
    this.setupFileInput()
    this.setupDropzone()
    this.setupLabel()
    this.setupStatusBox()
  }

  DocumentUpload.prototype.setupDropzone = function () {
    this.fileInput.wrap('<div class="moj-multi-file-upload__dropzone" />')
    this.dropzone = this.params.container.find('.moj-multi-file-upload__dropzone')
    this.dropzone.on('dragover', $.proxy(this, 'onDragOver'))
    this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave'))
    this.dropzone.on('drop', $.proxy(this, 'onDrop'))
  }

  DocumentUpload.prototype.setupLabel = function () {
    this.label = $(
      '<label for="' +
        this.fileInput[0].id +
        '" class="govuk-button govuk-button--secondary">' +
        this.params.dropzoneButtonText +
        '</label>'
    )
    this.dropzone.append('<p class="govuk-body">' + this.params.dropzoneHintText + '</p>')
    this.dropzone.append(this.label)
  }

  DocumentUpload.prototype.setupFileInput = function () {
    this.fileInput = this.params.container.find('.moj-multi-file-upload__input')
    this.fileInput.on('change', $.proxy(this, 'onFileChange'))
    this.fileInput.on('focus', $.proxy(this, 'onFileFocus'))
    this.fileInput.on('blur', $.proxy(this, 'onFileBlur'))
  }

  DocumentUpload.prototype.setupStatusBox = function () {
    this.status = $('<div aria-live="polite" role="status" class="govuk-visually-hidden" />')
    this.dropzone.append(this.status)
  }

  DocumentUpload.prototype.onDragOver = function (e) {
    e.preventDefault()
    this.dropzone.addClass('moj-multi-file-upload--dragover')
  }

  DocumentUpload.prototype.onDragLeave = function () {
    this.dropzone.removeClass('moj-multi-file-upload--dragover')
  }

  DocumentUpload.prototype.onDrop = function (e) {
    e.preventDefault()
    this.dropzone.removeClass('moj-multi-file-upload--dragover')
    this.feedbackContainer.removeClass('moj-hidden')
    this.status.html(this.params.uploadStatusText)
    this.uploadFiles(e.originalEvent.dataTransfer.files)
  }

  DocumentUpload.prototype.onFileChange = function (e) {
    if (e.currentTarget.files.length) {
      this.feedbackContainer.removeClass('moj-hidden')
      this.status.html(this.params.uploadStatusText)
      this.uploadFiles(e.currentTarget.files)
      this.fileInput.replaceWith($(e.currentTarget).val('').clone(true))
      this.setupFileInput()
      this.fileInput.focus()
    }
  }

  DocumentUpload.prototype.onFileFocus = function (e) {
    this.label.addClass('moj-multi-file-upload--focused')
  }

  DocumentUpload.prototype.onFileBlur = function (e) {
    this.label.removeClass('moj-multi-file-upload--focused')
  }

  DocumentUpload.prototype.uploadFiles = function (files) {
    this.params.uploadFileEntryHook(this, files)
    var formData = new FormData()
    const existingDocIds = []
    this.feedbackContainer.find('.document-row').each((index, value) => {
      existingDocIds.push($(value).attr('id'))
      formData.append($(value).attr('name'), $(value).val())
    })
    formData.append('upload', 'upload')
    formData.append('existingDocIds', JSON.stringify(existingDocIds))
    for (var i = 0; i < files.length; i++) {
      formData.append('documents', files[i])
    }
    const feedback = this.feedbackContainer
    const progress = this.params.container.find('#uploads-progress')
    $.ajax({
      url: this.params.uploadUrl,
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      success: $.proxy(function (response) {
        if (response.reload === true) {
          return window.location.reload()
        }
        progress.html('')
        if (response.addToExistingUploads) {
          this.params.container.find('#uploads-list').append(response.success)
        } else {
          feedback.html(response.success)
        }
        this.params.container.find('#uploaded-documents-heading').focus()
      }, this),
      xhr: function () {
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener(
          'progress',
          function (e) {
            if (e.lengthComputable) {
              var percentComplete = e.loaded / e.total
              percentComplete = parseInt(percentComplete * 100, 10)
              progress.html(
                '<div class="govuk-body-m govuk-!-margin-bottom-4">Your files are uploading: ' +
                  percentComplete +
                  '%</div>'
              )
            }
          },
          false
        )
        return xhr
      },
    })
  }
}
