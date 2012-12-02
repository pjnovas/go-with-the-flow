ORDERED_TESTS = test/when.js

test:	
	./node_modules/.bin/mocha $(ORDERED_TESTS) --reporter spec

.PHONY: test