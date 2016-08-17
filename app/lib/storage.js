var _bhStorage = function(uuid, defaults, suffix) {
	var data = {}, subscribers = []

	init()

	function init() {
		read(function(_data) {
			if (_data) {
				data = _data
				emit('ready')
				emit('change', data)
			} else {
				data = defaults
				write(undefined, undefined, function() {
					emit('ready')
					emit('change', data)
				})
			}
		})
	}

	function write(index, value, cb) {
		if (typeof index !== 'undefined' && typeof value !== 'undefined') {
			if (index in data) {
				data[index].value = value
			} else if (index in defaults) {
				data[index] = {
					type: defaults[index].type,
					title: defaults[index].title,
					value: value
				}
			} else {
				console.error('Tried to set an invalid option: '+index)
			}
		}

		var set = {}
		set[uuid+suffix] = data
		chrome.storage.sync.set(set, function(){cb(); emit('changed', data)})
	}

	function read(cb) {
		try {
			var key = uuid+suffix
			chrome.storage.sync.get(key, function(data) {
				if (Object.keys(data).length && key in data) {
					cb(data[key])
				} else {
					cb(false)
				}
			})
		} catch(e) {
			cb(false)
		}
	}

	function on(event, fn) {
		subscribers.push({
			event: event,
			fn: fn
		})
	}

	function emit(event, arg) {
		for (var i in subscribers) {
			var sub = subscribers[i]
			if (typeof sub.fn === 'function' && sub.event == event) sub.fn.call(this, arg)
		}
	}

	return {
		data: data,
		write: write,
		read: read,
		on: on
	}
}