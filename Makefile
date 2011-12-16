.PHONY:	all lint test deps

SRC_FILES=`ls *.js public/js/*.js`
TEST_FILES=`find ./test -name 'test-*.js'`

all:	lint test

deps:
	@npm install ejs express jade socket.io sax

test:
	@nodeunit $(TEST_FILES)

lint:
	@jshint $(SRC_FILES)
