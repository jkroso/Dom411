build:
	@bigfile --write=dist/Dom411.js -pc -x Dom411

test:
	@mocha test/Dom411.test.js