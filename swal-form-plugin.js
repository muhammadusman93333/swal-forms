// extend swal with a function for adding forms
swal.withForm = function() {
  // initialize with field values supplied on `swal.withForm` call
  var swalForm = new SwalForm(arguments[0].formFields)
  // prevent successive calls to add duplicated form fields
  swalForm.removeSwalForm()
  // make form values inserted by the user available on `doneFunction`
  swalForm.addWayToGetFormValuesInDoneFunction(arguments)

  // forward arguments
  swal.apply({}, arguments)

  var htmlForm = swalForm.generateHtmlForm()
  swalForm.insertFormInSwalModal(htmlForm)
  // by default swal modals have tabIndex=-1 which prevents
  // text selection and user input on tags
  swalForm.makeInputsWritable()
}

// constructor for helper object
function SwalForm(formFields) {
  this.formFields = formFields
}

// helper methods
extend(SwalForm.prototype, {
  formClass: 'swal-form',
  generateHtmlForm: function() {
    var formInnerHtml = this.formFields.map(toFormTag).reduce(toSingleString)
    return  '<div class="' + this.formClass + '">' + formInnerHtml + '</div>'

    function toFormTag(field) {
      var placeholder = field.placeholder
      if (!placeholder) {
        placeholder = field.id
          // insert a space before all caps
          .replace(/([A-Z])/g, ' $1')
          // uppercase the first character
          .replace(/^./, function(str){ return str.toUpperCase(); })
      }
      return '<input type="text"' +
        ' id="' + field.id + '"' +
        ' placeholder="' + placeholder + '"' +
      '/>'
    }

    function toSingleString(tagSting1, tagSting2) {
      return tagSting1 + tagSting2
    }
  },
  addWayToGetFormValuesInDoneFunction: function(swalArgs) {
    var self = this
    var doneFunction = swalArgs[1]
    swalArgs[1] = function() {
      // make form values available at `this` variable inside doneFunction
      this.swalForm = self.getFormValues()
      doneFunction.apply(this, arguments)
    }
  },
  getFormValues: function() {
    var inputHtmlCollection = document.querySelector('div.' + this.formClass).getElementsByTagName('input')
    var inputArray = [].slice.call(inputHtmlCollection)

    return inputArray.map(toValuableAttrs).reduce(toSingleObject)

    function toValuableAttrs(tag) {
      var attr = {}
      attr[tag.id] = tag.value
      return attr
    }

    function toSingleObject(obj1, obj2) {
      return extend(obj1, obj2)
    }
  },
  insertFormInSwalModal: function(htmlFormString) {
    var formTag = stringToTag(htmlFormString)
    var sweetAlertModal = document.querySelector('.sweet-alert')
    var cancelButtonTag = sweetAlertModal.querySelector('.cancel')
    sweetAlertModal.insertBefore(formTag, cancelButtonTag)

    function stringToTag(string) {
      var div = document.createElement('div')
      div.innerHTML = string
      return div.firstChild
    }
  },
  makeInputsWritable: function() {
    document.querySelector('.sweet-alert').removeAttribute('tabIndex')
  },
  removeSwalForm: function() {
    var formTag = document.querySelector('.' + this.formClass)
    formTag && document.querySelector('.sweet-alert').removeChild(formTag)
  }
})

function extend(a, b){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key]
    }
  }

  return a
}