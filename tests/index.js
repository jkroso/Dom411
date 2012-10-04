require.config({
    baseUrl: '../src',
    shim : {
        mocha : {
            exports : 'mocha'
        },
        chai : {
            exports : 'chai'
        }
    },
    paths : {
        mocha : '../tests/mocha',
        chai : '../tests/chai',
        Observer: '../../Observer/dist/Observer',
        Adept: '../../adept.js/adept'
    }
})

require(['require', 'mocha', 'chai'], function (require, mocha, chai) {
    window.should = chai.Should()
    window.expect = chai.expect

    mocha.setup('bdd')
    
    require(['../tests/Dom411_test'], function () {
        mocha.run()
    })
})
