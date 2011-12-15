.PHONY:	all lint deps

SRC_FILES=`ls *.js public/js/*.js`

all:	lint

deps:
	@npm install ejs express jade socket.io xml2js

lint:
	@jshint $(SRC_FILES)
