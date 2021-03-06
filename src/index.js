var Bus = require('Bus'),
	Context = require('Context'),
	invokeList = Bus.invokeList, 
	collect = Bus.collect, 
	branchingCollect = Bus.branchingCollect

module.exports = Context

// Shim browser support
Element.prototype.matchesSelector = Element.prototype.matchesSelector
	|| Element.prototype.webkitMatchesSelector
	|| Element.prototype.mozMatchesSelector
	|| Element.prototype.msMatchesSelector
	|| Element.prototype.oMatchesSelector
	|| function (selector) {
		var nodes = this.parentNode.querySelectorAll(selector),
			len = nodes.length
		while (len--) {
			if (nodes[len] === this) return true
		}
		return false
	}

// All of the mouse events which get exposed in the API require a certain DOM event in order to work properly. This table provides the conversion
var translate = {
	down  : 'mousedown',
	up    : 'mouseup',
	move  : 'mousemove',
	over  : 'mouseover',
	out   : 'mouseout',
	click : 'mouseup',
	wheel : 'mousewheel',
	double: 'mouseup',
	type  : 'input'
}
var subjects = new WeakMap

// The handler used for all DOM events. It plucks event type info of the event object and hands it to the Observer instance that was mapped to `this` DOM node
function dispatch (e) {
	var types = e.types || [e.type]
	return invokeList(
		// Test the format of the event directive...
		typeof types[0] === 'string' ?
			// ...['mouse', 'up']
			collect(subjects.get(this), types) :
			// ...[['mouse', ['up']]]
			branchingCollect(subjects.get(this), types),
		e)
}

// Create an instance of Observer and add it to the node-subject map
function createSubject (node) {
	var s = Object.defineProperties(new Bus, {
		_capturing : {
			value : Object.create(null),
			writable : true
		},
		_bubbling : {
			value : Object.create(null),
			writable : true
		}
	})
	subjects.set(node, s)
	return s
}

// Find the first top level topic in a topic sequence string. e.g. travel.left would return travel. If in the translation table this top level topic will be translated in the native version
function topType (topic) {
	var firstDot = topic.indexOf('.'),
		eventType = firstDot >= 0 ? topic.slice(0, firstDot) : topic        
	return eventType in translate ? translate[eventType] : 'library'
}

function incCount (eGenre, counter) {
	if ( typeof counter[eGenre] === 'undefined' ) {
		counter[eGenre] = 0
	}
	return ++counter[eGenre]
}

function decCount (eGenre, counter) {
	var count = --counter[eGenre]
	if (  count <= 0 ) {
		delete counter[eGenre]
	}
	return count
}

// A helper for creating Event instances
function CustomEvent (options) {
	var event = new Event('library', {
		bubbles : true,
		cancelable : true
	})
	Object.keys(options).forEach(function (key) {
		event[key] = options[key]
	})
	return event
}

Context.Event = CustomEvent
var proto = Context.prototype

proto.trigger = function (topic, data) {
	if ( topic instanceof Event ) {
		this.each(function () {
			this.dispatchEvent(CustomEvent(topic))
		})
	} else {
		if ( typeof topic !== 'string' ) {
			data = topic
			topic = ''
		}
		this.each(function () {
			this.dispatchEvent(CustomEvent({
				types : topic.split(/\./),
				name : topic,
				data : data
			}))
		})
	}
	return this
}

proto.on = function (topics, fn, bubbles) {
	// Default the bubbles option to false
	if ( typeof bubbles !== 'boolean' ) bubbles = false
	if ( typeof topics === 'string' ) {
		this.each(function () {
			var subject = subjects.get(this) || createSubject(this)
			topics.split(/\s+/).forEach(function (topic) {
				var eGenre = topType(topic)
				if ( incCount(eGenre, bubbles ? subject._capturing : subject._bubbling) === 1 ) {
					this.addEventListener(eGenre, dispatch, bubbles)
				}
			}, this)
			subject.on(topics, fn, this)
		})
	// Assume there is no topic; create a top level event
	} else {
		// Check if a bubbles option was provided
		if ( typeof fn === 'boolean' ) bubbles = fn
		this.each(function () {
			var subject = subjects.get(this) || createSubject(this)
			if ( incCount('library', bubbles ? subject._capturing : subject._bubbling) === 1 ) {
				this.addEventListener('library', dispatch, bubbles)
			}
			subject.on(topics, this) // topics is the fn
		})
	}
	return this
}

proto.once = function (topics, fn, bubbles) {
	// Keep a ref to the original set so all nodes will have this handler 
	// removed not just the one that actually gets triggered
	var self = this
	this.on(topics, function callback (e) {
		self.off(topics, callback, bubbles)
		fn.call(this)
	}, bubbles)
}

proto.delegate = function (selector, topics, fn, bubbles) {
	this.each(function (node) {
		Context(this).on(topics, function delegater (e) {
			var target = e.target
			while (target !== this) {
				if ( target.matchesSelector(selector) ) return fn.call(target, e)
				target = target.parentElement
			}
		}, bubbles)
	})
	return this
}

proto.off = function (topics, fn, bubbles) {
	var args = arguments
	if ( typeof topics === 'string' ) {
		if ( typeof bubbles !== 'boolean' ) bubbles = true
		this.each(function () {
			var subject = subjects.get(this)
			if (!subject) return
			topics.split(/\s+/).forEach(function (topic) {
				var eGenre = topType(topic)
				if (decCount(eGenre, bubbles ? subject._capturing : subject._bubbling) === 0 ) {
					this.removeEventListener(eGenre, dispatch, bubbles)
				}
			}, this)
			subject.off(topics, fn)
		})
	} else if (arguments.length) {
		fn = topics
		bubbles = typeof fn === 'boolean' ? fn : true
		this.each(function () {
			var subject = subjects.get(this)
			if ( ! subject ) return
			if ( decCount('library', bubbles ? subject._capturing : subject._bubbling) === 0 ) {
				this.removeEventListener('library', dispatch, bubbles)
			}
			subject.off(fn)
		})
	} else {
		this.each(function () {
			var subject = subjects.get(this)
			if ( ! subject ) return
			Object.keys(subject._bubbling).forEach(function (key) {
				this.removeEventListener(key, dispatch, false)
			}, this)
			Object.keys(subject._capturing).forEach(function (key) {
				this.removeEventListener(key, dispatch, true)
			}, this)
			subjects.delete(this)
		})
	}
	return this
}

proto.transferListeners = function (target) {
	var node = this[0]
	if ( subjects.has(node) ) {
		var subject = subjects.get(node)
		subjects.delete(node)
		
		Object.keys(subject._DOMListeners).forEach(function (key) {
			node.removeEventListener(key, dispatch, true)
			target.addEventListener(key, dispatch, true)
		})
		subjects.set(target, subject)
	}
	return this
}