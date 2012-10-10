define([
    '../../Observer/lib/Observer',
    '../../Context/src/Context'
], function (Observer, $) {
    'use strict';
    Observer = Observer.constructor
    
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
    var dispatch = (function (invokeList, collect, branchingCollect, subjects) {
        return function (e) {
            return invokeList(
                // Test the format of the event directive...
                typeof e.types[0] === 'Array' ?
                    // ...[['mouse', ['up']]]
                    branchingCollect(
                        subjects.get(this),
                        e.types || [e.type]) :
                    // ...['mouse', 'up']
                    collect(
                        subjects.get(this),
                        e.types || [e.type]),
                e)
        }
    }(Observer.invokeList, Observer.collect, Observer.branchingCollect,subjects))

    // Create an instance of Observer and add it to the node-subject map
    function createSubject (node) {
        var s = Object.defineProperties(new Observer, {
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

    $.Event = CustomEvent

    $.fn.trigger = function (topic, data) {
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

    $.fn.on = function (topics, fn, bubbles) {
        if ( typeof bubbles !== 'boolean' ) bubbles = true
        if ( typeof topics === 'string' ) {
            this.each(function () {
                var subject = subjects.get(this) || createSubject(this)
                topics.split(/\s+/).forEach(function (topic) {
                    var eGenre = topType(topic)
                    if ( incCount(eGenre, bubbles ? subject._capturing : subject._bubbling) === 1 ) {
                        this.addEventListener(eGenre, dispatch, bubbles)
                    }
                }, this)
                subject.on(topics, this, fn)
            })
        // Assume there is no topic; create a top level event
        } else {
            var subject = subjects.get(this) || createSubject(this)
            if ( typeof fn === 'boolean' ) bubbles = fn
            this.each(function () {
                if ( incCount('library', bubbles ? subject._capturing : subject._bubbling) === 1 ) {
                    this.addEventListener('library', dispatch, bubbles)
                }
                subject.on(this, topics) // topics is the fn
            })
        }
        return this
    }

    $.fn.next = function (topics, fn, bubbles) {
        // Keep a ref to the original set so all nodes will have this handler removed not just the one that actually gets triggered
        var self = this
        this.on(topics, function callback (e) {
            self.off(topics, callback, bubbles)
            fn.call(this)
        }, bubbles)
    }

    $.fn.delegate = function (selector, topics, fn, bubbles) {
        this.each(function (node) {
            $(this).on(topics, function delegater (e) {
                var target = e.target
                while (target !== this) {
                    if ( target.matchesSelector(selector) ) return fn.call(target, e)
                    target = target.parentElement
                }
            }, bubbles)
        })
        return this
    }
    
    $.fn.off = function (topics, fn, bubbles) {
        var args = arguments
        if ( typeof topics === 'string' ) {
            if ( typeof bubbles !== 'boolean' ) bubbles = true
            this.each(function () {
                var subject = subjects.get(this)
                if ( ! subject ) return
                topics.split(/\s+/).forEach(function (topic) {
                    var eGenre = topType(topic)
                    if ( decCount(eGenre, bubbles ? subject._capturing : subject._bubbling) === 0 ) {
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

    $.fn.transferListeners = function (target) {
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

    return $
})