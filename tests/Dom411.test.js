define(['../src/Dom411', 'chai'], function ($, chai) {'use strict';
	describe('Dom411', function () {
		afterEach(function () {
			// Clear all events
			$('div').off()
		})

		describe('.on(topics, fn, bubbles)', function () {
			
			it('Should not throw any errors', function () {
				$('#targ1').on('test', function (e) {})
				$('#targ1').on(function (e) {})
			})
		})
		
		describe('.off(topics, fn, bubbles)', function () {
			beforeEach(function () {
				$('#targ1').on('test', function (e) {})
				$('#targ1').on(function (e) {})
			})
			
			it('Should not throw any errors', function () {
				$('#targ1').off('test')
				$('#targ1').off()
			})
		})
		
		describe('.trigger(topic, data)', function () {
			beforeEach(function () {

			})
			
			it('Should trigger the fn', function (next) {
				$('#targ2')
					.on('test', function (e) {
						next()
					})
					.trigger('test')
			})
			
			it('Should fire in the correct dom order', function () {
				var c = 0
				$('#lvl1').on('test', function (e) {
					c++
					c.should.be.equal(1)
				})
				$('#lvl2').on('test', function (e) {
					c++
					c.should.be.equal(2)
				})
			})
			
			it('Should fire in the correct subscription order', function () {
				var c = 0
				$('#lvl1').on('test', function (e) {

				})
			})
			
			it('Should deliver a copied event object to each node', function (next) {
				var event = $.Event({
					randomAttr:76,
					types: ['test'],
					name: 'test'
				})
				$('#lvl1').on('test', function (e) {
					e.should.not.be.equal(event)
					e.randomAttr.should.be.equal(76)
					next()
				})
				$('#lvl1').trigger(event)
			})
		})

		describe('.delegate(selector, topic, fn, [bubbles])', function () {
			beforeEach(function () {
				$('div').off()
			})
			
			it('Should only be triggered when a child in the event path matched the selector', function (next) {
				$('#test-dom').delegate('#targ1', 'test', function (e) {
					next()
				})
				$('#targ1').trigger('test')
			})
			
			it('Should call the matching node as the current context', function (next) {
				$('#lvl2').delegate('#targ2', 'test', function (e) {
					this.should.be.equal($('#targ2')[0])
					next()
				})
				$('#targ2').trigger('test')
			})
		})
		
		describe('.transferListeners(target)', function () {
			it('description'    )
		})
	})
})