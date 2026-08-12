
### Local building rule

BUILD = ../public/aideweb.js

../public/aideweb.js : ../public/slugstring.js ../public/cookies.js ../public/HttpQuery.js ../public/PersistantData.js ../public/ServerEvent.js ../public/RemanentForm.js ../public/WrapperCC.js
	@cat $^ > $@

### Includes aidebuild standard usage,build,test,clean,sync rules
include ./.makefile.inc
