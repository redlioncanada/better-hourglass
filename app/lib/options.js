var _bhOptions = (function() {
	var storage = _bhStorage(_bhConfig.uuid, _bhConfig.options.defaults, _bhConfig.options.suffix)

	var optionClass = function(name, opts){
		var valueElement, changeEvent
		switch(opts.type) {
			case 'input':
				var divElement = $('<div></div>', {
					class: 'input'
				})
				var inputElement = $('<input></input>', {
					class: 'input',
					type: 'text',
					name: name,
					value: opts.value
				})
				valueElement = divElement.append(inputElement)
				changeEvent = 'change'
				break
			case 'checkbox':
				valueElement = $('<input></input>', {
					class: 'input',
					type: 'checkbox',
					name: name,
					checked: opts.value
				})
				changeEvent = 'change'
				break
			default:
				console.error('Tried to instantiate an invalid element type: '+opts.type)
				break
		}

		var titleElement = $('<div></div>', {
			'data-id': name,
			class: 'title',
			text: opts.title + ":"
		})

		var parentElement = $('<li></li>', {
			class: 'option',
			'data-name': name,
			'data-event': changeEvent
		})

		return parentElement.append(titleElement).append(valueElement)
	}

	var bootstrap = (function() {
		var ready = 0

		$(function() {
			ready++
			init()
		})

		storage.on('ready', function() {
			ready++
			init()
		})

		function init() {
			console.log('ready')
			if (ready == 2) app()
		}
	})()

	var app = function() {
		var init = false
		$('body').on('change', 'input', function(e) {
			var element = $(e.target)
			var name = element.closest('li').attr('data-name')
			var value = element.val()

			storage.write(name, value)
		})

		storage.on('change', function(obj) {
			if (!init) {
				for (var name in obj) {
					var data = obj[name]
					$('ul').append(optionClass(name, data))
				}
				init=true
			}
		})
	}
})()