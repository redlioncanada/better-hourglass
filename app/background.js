(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-76738709-1', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/background.html');

var _bhBackground = (function() {
	var storage = _bhStorage(_bhConfig.uuid, _bhConfig.options.defaults, _bhConfig.options.suffix)
	var debug = !('update_url' in chrome.runtime.getManifest());	//checks whether the runtime was downloaded from the store or not
	var options = {}

	var track = (function() {
		function _send(c,a,l) {
			if (!(c && a)) return;
			if (typeof l !== 'undefined') {
				ga('send', 'event', c, a, l);
			} else {
				ga('send', 'event', c, a);
			}
		}

		return {
			ignoredUser: function(name,title) {return _send('BetterHourglass', 'Added Time', name+"|"+title)}
		}
	})();

	var dom = (function() {
		//caches zepto elements
		var elements = {};

		function _getElement(id, selector, static) {
			if (typeof static === 'undefined') static = false;
			if (id in elements && static) {
				return elements[id];
			} else {
				var element = $(selector);
				if (element.length && static) {
					elements[id] = element;
				}
				return element;
			}
		}

		return {
			getHoursProjectEntrySelectors: function() {return _getElement('hours-project-selectors', '#enter_hours .entry select', true)},
			getHoursProjectEntries: function() {return _getElement('hours-project-entries', '#enter_hours tr .entry:nth-child(2)', true)},
			getHoursProjectEntryInputs: function() {return _getElement('hours-project-inputs', '#enter_hours .entry input.autocomplete', true)},
			getHoursProjectDescriptions: function() {return _getElement('hours-project-descriptions', '#enter_hours tr .entry:nth-child(4) input', true)}
		};
	})();

	var log = function() {
		//appends the app name to console.log calls
		var obj = arguments.length > 1 ? Array.prototype.slice.call(arguments).join(',  ') : arguments[0]
		if (debug && ((typeof obj === 'string' && obj.length) || typeof obj === 'object' || typeof obj === 'boolean')) console.log('Better Hourglass: ', obj)
	}

	var page = (function() {
		var temp = window.location.host.split('.'),
			host = window.location.host,
			domain = temp.length > 2 ? temp.slice(temp.length-2, temp.length).join('.') : host,
			subdomain = temp.length > 2 ? temp.slice(0, temp.length-2).join('.') : undefined,
			path = window.location.pathname;

		return {
			shouldRun: function() {
				return !!subdomain && subdomain.toLowerCase().indexOf('hourglass') > -1
			},
			at: function(name) {
				switch(name) {
					case 'hours':
						return path.indexOf(name) > -1
					default:
						return false
				}
			},
			url: {
				host: host,
				domain: domain,
				subdomain: subdomain,
				path: path
			}
		}
	})();

	var actions = (function() {
		function hours() {
			log('init hours page')

			autocompleteDockets()
			insertDefaultDescriptions()

			function insertDefaultDescriptions() {
				var descriptions = dom.getHoursProjectDescriptions()

				$(descriptions).each(function(index, value) {
					var element = $(value)
					if (!!options.description.value) element.val(options.description.value)
				})
			}

			function autocompleteDockets() {
				var entries = dom.getHoursProjectEntries(),
					selectors = dom.getHoursProjectEntrySelectors()

				selectors.css('width', '70%')
				entries.append(
					$('<input></input>', {
						placeholder: 'autocomplete...',
						width: '27%',
						class: 'autocomplete'
					})
				)

				var inputs = dom.getHoursProjectEntryInputs(),
					fuseOptions = {
						caseSensitive: false,
						shouldSort: true,
						tokenize: false,
						threshold: 0.6,
						location: 0,
						distance: 100,
						maxPatternLength: 32,
						keys: [
							"id",
							"title"
						]
					},
					data = getSelectorData(selectors.eq(0)),
					fuse = new Fuse(data, fuseOptions)

				inputs.on('keyup', function(e) {
					var element = $(e.target),
						dropdown = element.parent().find('select'),
						search = fuse.search(element.val())

						if (!element.val().length) return
						if (search.length) dropdown.find('option:nth-child('+ search[0].index +')').attr('selected', true)
				})

				function getSelectorData(selector) {
					var items = []
					$.each($(selector).find('option'), function(index, item) {
						items.push({
							id: $(item).attr('value'),
							title: $(item).text(),
							index: index+1
						})
					})
					return items
				}
			}
		}

		return {
			hours: hours
		}
	})()

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

		storage.on('change', function(data) {
			options = data
			ready++
			init()
		})

		function init() {
			if (ready == 3) app()
		}
	})()

	var app = function() {
		//app main
		if (page.shouldRun()) {
			log('init');

			if (page.at('hours')) {
				actions.hours()
			}
		}
	};
})();