
define package
{
  login: $login
  dependencies: [ idnai-make express node-arp node-sync-fetch https://github.com/yhirose/cpp-httplib ]
}
endef

## This contains all usual rule to build the package

ifneq (,$(shell ls node_modules/idnai-make/src/makefile-rules.mk))
include node_modules/idnai-make/src/makefile-rules.mk
endif

## Package specific rules are defined below:

nothing:
	echo "Nothing is more that not anything"


