require.config({
    baseUrl: '../src',
    shim : {
        mocha : {
            exports : 'mocha'
        },
        chai : {
            exports : 'chai'
        },
        Adept: {
            exports: '$'
        }
    },
    paths : {
        mocha : '../tests/mocha',
        chai : '../tests/chai',
        Adept: '/Libraries/jquery-latest'
    }
})

require(['require', 'mocha', 'chai', 'Adept'], function (require, mocha, chai, $) {
    window.should = chai.Should()
    window.expect = chai.expect

    mocha.setup('bdd')
    
    require(['../tests/Dom411_test'], function () {
        mocha.run()
    })
})
