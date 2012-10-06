define(['../src/Dom411', 'chai'], function ($, chai) {
    describe('Dom411', function () {
        afterEach(function () {
            // Clear all events
            $('div').unsubscribe()
        })
        describe('.subscribe(topics, fn, bubbles)', function () {
            it('Should not throw any errors', function () {
                $('#targ1').subscribe('test', function (e) {})
                $('#targ1').subscribe(function (e) {})
            })
        })
        describe('.unsubscribe(topics, fn, bubbles)', function () {
            beforeEach(function () {
                $('#targ1').subscribe('test', function (e) {})
                $('#targ1').subscribe(function (e) {})
            })
            it('Should not throw any errors', function () {
                $('#targ1').unsubscribe('test')
                $('#targ1').unsubscribe()
            })
        })
        describe('.publish(topic, data)', function () {
            beforeEach(function () {

            })
            it('Should trigger the fn', function (next) {
                $('#targ2')
                    .subscribe('test', function (e) {
                        next()
                    })
                    .publish('test')
            })
            it('Should fire in the correct dom order', function () {
                var c = 0
                $('#lvl1').subscribe('test', function (e) {
                    c++
                    c.should.be.equal(1)
                })
                $('#lvl2').subscribe('test', function (e) {
                    c++
                    c.should.be.equal(2)
                })
            })
            it('Should fire in the correct subscription order', function () {
                var c = 0
                $('#lvl1').subscribe('test', function (e) {

                })
            })
            it('Should deliver a copied event object to each node', function (next) {
                var event = $.Dom411({
                    randomAttr:76,
                    types: ['test'],
                    name: 'test'
                })
                $('#lvl1').subscribe('test', function (e) {
                    e.should.not.be.equal(event)
                    e.randomAttr.should.be.equal(76)
                    next()
                })
                $('#lvl1').publish(event)
            })
        })
        describe('.forward(selector, topic, fn, [bubbles])', function () {
            beforeEach(function () {
                $('div').unsubscribe()
            })
            it('Should only be triggered when a child in the event path matched the selector', function (next) {
                $('#test-dom').forward('#targ1', 'test', function (e) {
                    next()
                })
                $('#targ1').publish('test')
            })
            it('Should call the matching node as the current context', function (next) {
                $('#lvl2').forward('#targ2', 'test', function (e) {
                    this.should.be.equal($('#targ2')[0])
                    next()
                })
                $('#targ2').publish('test')
            })
        })
        describe('.transferListeners(target)', function () {
            it('description'    )
        })
    })
})