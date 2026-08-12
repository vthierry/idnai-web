
### Warning : this .makefile.inc file is overwritten at each installation, do NOT edit

.NOTPARALLEL:
SHELL := /bin/bash

# Shows makefile usage

define USAGE
 Usage: make $$target
 Targets:
  usage: shows this usage.
  build: builds all compiled files.
  build_mpl: run maple preprocessing files, if any.
  build_cpp: compiles C/C++ files, if any.
  build_gyp: compiles the node-gyp wrapper files, if any.
  build_python: generates a python wrapper of the compiled C/C++ files.
  build_public: compiles all public web site documentation files.
  test: runs automatic functional and non-regression tests.
  test  MAIN="" ARGV="": runs interactive tests.
  gtest MAIN="" ARGV="": runs interactive tests through gdb.
  vtest MAIN="" ARGV="": runs interactive tests through valgrind.
     MAIN: the *.C program name, 'test' by default.
     ARGV: the program arguments, if any, for either $MAIN.C or, by default, test.C test.sh test.js.
  clean: cleans all installation files.
  sync: syncs the files with the git repository. If approriate also indicate ho to sync with the npm platform.
  show: shows the doc using the current browser, or firefox.
  install: installs the source files (normally only called by `npm install`, not via the `make` command).
  rebuild: clean, pull and rebuild the whole package.
Option:
  Verbose mode is enabled with the construct
   - `export VERBOSE=true; make $$target` or
   - defining `export VERBOSE = true` in the makefile or
   - `make --debug=$$value $$target` (including $$value=none).
endef
export USAGE

usage:
	@echo "$$USAGE"

# Defines makefile environment variables

.PHONY: usage build build_mpl build_cpp build_gyp build_python build_public test gtest vtest clean sync show install rebuild

## Gets a package.json value, e.g., ifeq (myname,$(call getpackagevalue,name)) without space after the ','
getpackagevalue = $(shell grep -m 1 '"$(1)" *:' ../package.json | sed 's/^[^:]*:[ "]*//' | sed 's/[" ,]*$$//')

## Sets environment variables AIDE_PACKAGE_NAME AIDE_NODE_MODULES_DIR AIDE_NODE_MODULE ON_MAC ON_RASPI ON_WIN

export AIDE_PACKAGE_NAME = $(call getpackagevalue,name)

ifeq (node_modules,$(notdir $(patsubst %/,%,$(dir $(patsubst %/,%,$(dir $(shell pwd)))))))
export AIDE_NODE_MODULE = true
export AIDE_NODE_MODULES_DIR = $(realpath ../..)
export AIDE_ROOT_PACKAGE_NAME = $(shell grep -m 1 '"name" *:' ../../../package.json | sed 's/^[^:]*:[ "]*//' | sed 's/[" ,]*$$//')
AIDE_VERBOSE_ROOT_PACKAGE_NAME = root_name: '$(AIDE_ROOT_PACKAGE_NAME)'
else
export AIDE_NODE_MODULE = false
export AIDE_NODE_MODULES_DIR = $(shell if [ -d ../node_modules ] ; then echo `realpath ../node_modules` ; else echo ../node_modules ; fi)
endif

ifeq (Darwin,$(shell uname -s))
export ON_MAC = true
AIDE_OS_CCFLAGS = -D ON_MAC
endif
ifeq (armv7l,$(shell uname -m))
export ON_RASPPI = true
AIDE_OS_CFLAGS = -D ON_RASPPI
endif
ifeq (CYGWIN,$(shell uname -s | sed 's/_.*//'))
export ON_WIN = true
AIDE_OS_CCFLAGS = -D ON_WIN
endif

ifeq (,$(BROWSER))
export BROWSER = firefox
endif

ifeq (--debug,$(findstring --debug,$(MAKEFLAGS)))
export VERBOSE = true
endif
ifeq (true,$(VERBOSE))
AIDE_VERBOSE_CCFLAG = -D VERBOSE
endif

ifeq (true,$(VERBOSE))
$(shell >&2 echo "make info { name: '$(AIDE_PACKAGE_NAME)' $(AIDE_VERBOSE_ROOT_PACKAGE_NAME) target: '$(MAKECMDGOALS)' }")
endif

ifneq (aidebuild,$(AIDE_PACKAGE_NAME))
AIDEBUILDDEP = aidebuild
else
AIDEBUILDDEP =
endif

# Specifies build commands

build: build_mpl build_cpp build_gyp build_python build_public $(BUILD)
	@-git status -s

## Build maple preprocessing

## Runs maple with proper options, e.g., $(call maple,myfile.mpl)
### avoids maple branding, allows include files access, logs in ../public directory, outputs only if errors
maple = mkdir -p ../public ; maple -n -I $(AIDE_NODE_MODULES_DIR)/.inc $(1) | tail -n +6 | grep -v -E '^(> quit|memory used=)' > ../public/$(1).out.txt ; if grep -E '(^(Error|Warning),|syntax error)' ../public/$(1).out.txt > /dev/null ; then cat ../public/$(1).out.txt ; fi

ifneq (,$(shell which maple 2>/dev/null))
ifneq (,$(wildcard *.mpl))

build_mpl: ../.build_mpl_dependencies_done $(patsubst %.mpl,../public/%.mpl.out.txt, $(filter-out test.mpl,$(wildcard *.mpl)))
	@touch ../.build_mpl_done

../.build_mpl_dependencies_done:
	@for d in $(AIDEBUILDDEP) $(AIDEDEPS) ; do if [ \! -f "$(AIDE_NODE_MODULES_DIR)/$$d/.build_mpl_done" ] ; then $(MAKE) -C $(AIDE_NODE_MODULES_DIR)/$$d/src build_mpl ; fi ; done
	@touch $@

../public/%.mpl.out.txt : %.mpl
	@mkdir -p $(@D)
ifeq (true,$(AIDE_NODE_MODULE))
	@$(call maple,$^)
else
ifneq (true,$(VERBOSE))
	@$(call maple,$^)
else
	@$(call maple,$^) > /dev/null ; cat $@
endif
endif
	@mkdir -p $(AIDE_NODE_MODULES_DIR)/.inc
	@(grep -v '^\s*#' < $^ | tr -d '\n\r' | sed 's/  */ /g' ; echo) > $(AIDE_NODE_MODULES_DIR)/.inc/$*.mpl
else
build_mpl:
	@touch ../.build_mpl_done
endif
else
build_mpl:
	@touch ../.build_mpl_done
endif

## Build C/C++ compilation commands

ifneq (false,$(call getpackagevalue,build_cpp))
ifneq (,$(join $(wildcard *.hpp),$(wildcard *.cpp),$(wildcard *.C)))

.PHONY: build_cpp_lib build_cpp_bin

build_cpp: build_mpl ../.build_cpp_dependencies_done build_cpp_lib build_cpp_bin
	@touch ../.build_cpp_done

../.build_cpp_dependencies_done: $(AIDE_NODE_MODULES_DIR)/*/src/*.*pp
	@for d in $(AIDEBUILDDEP) $(AIDEDEPS) ; do if [ \! -f "$(AIDE_NODE_MODULES_DIR)/$$d/.build_cpp_done" ] ; then $(MAKE) -C $(AIDE_NODE_MODULES_DIR)/$$d/src build_cpp ; fi ; done
	@touch $@

### Compilator choice and compilation variables

ifndef CXX
export CXX = c++
endif

AIDE_CCFLAGS = -g -fPIC -Wall -std=c++17 $(AIDE_OS_CCFLAGS) $(AIDE_VERBOSE_CCFLAG)

AIDE_INCDIRS = -I. $(patsubst %,-I$(AIDE_NODE_MODULES_DIR)/%/src,aidebuild $(AIDEDEPS))

PYTHON_INCDIRS = \
  -I/usr/include/python3.14 -I/usr/include/python3.13 -I/usr/include/python3.12 -I/usr/include/python3.11 -I/usr/include/python3.10 \
  -I/usr/local/Frameworks/Python.framework/Headers \
  -I/usr/include/python3.7m

AIDE_LIB = -l$(AIDE_PACKAGE_NAME)

DEST_LIB  = $(AIDE_NODE_MODULES_DIR)/.lib/lib$(AIDE_PACKAGE_NAME).a

DEST_BINS = $(patsubst %.C,$(AIDE_NODE_MODULES_DIR)/.bin/%,$(wildcard *.C))

### Library compilation commands

ifeq (,$(wildcard *.cpp))
AIDE_LIB = 
DEST_LIB  =
endif

build_cpp_lib: $(DEST_LIB)

$(DEST_LIB): $(wildcard *.hpp) $(wildcard *.cpp) ../.build_cpp_dependencies_done
	@$(CXX) -c $(CCFLAGS) $(AIDE_CCFLAGS) $(INCDIRS) $(AIDE_INCDIRS) $(PYTHON_INCDIRS) $(wildcard *.cpp)
	@mkdir -p $(@D) ; ar -rc $@ *.o ; ar -s $@ ; rm -f *.o
##### This dirty patch concatenates the libs and is used for node-gyp and on cygwin as a workaround for ld failure to find existing routines
	@cd $(AIDE_NODE_MODULES_DIR)/.lib ; for f in *.a ; do ar -x $$f ; done ; ar -rc lib$(AIDE_PACKAGE_NAME).a *.o ; ar -s lib$(AIDE_PACKAGE_NAME).a ; rm -f *.o

### Executable compilation commands

#### Libraries path and references

AIDE_LIBDIRS = -L$(AIDE_NODE_MODULES_DIR)/.lib
AIDE_LIBS    = $(AIDE_LIB) $(patsubst ../node_modules/.lib/lib%.a,-l%,$(wildcard ../node_modules/.lib/lib*.a)) -lstdc++ -lm

ifndef ON_WIN
AIDE_LIBS  += -lcurl
endif

ifneq (,$(wildcard /usr/lib*/libpython3.14.so /usr/lib/*/libpython3.14.so))
PYTHON_LIB = -lpython3.14
else
ifneq (,$(wildcard /usr/lib*/libpython3.13.so /usr/lib/*/libpython3.13.so))
PYTHON_LIB = -lpython3.13
else
ifneq (,$(wildcard /usr/lib*/libpython3.12.so /usr/lib/*/libpython3.12.so))
PYTHON_LIB = -lpython3.12
else
ifneq (,$(wildcard /usr/lib*/libpython3.11.so /usr/lib/*/libpython3.11.so))
PYTHON_LIB = -lpython3.11
else
ifneq (,$(wildcard /usr/lib*/libpython3.10.so /usr/lib/*/libpython3.10.so))
PYTHON_LIB = -lpython3.10
else
ifdef ON_RASPPI
PYTHON_LIB = -lpython3.7m
endif
endif
endif
endif
endif
endif
AIDE_LIBS += $(PYTHON_LIB)

build_cpp_bin: $(DEST_BINS)

$(AIDE_NODE_MODULES_DIR)/.bin/%: %.C $(DEST_LIB)
	@mkdir -p $(@D)
	@$(CXX) $(CCFLAGS) $(AIDE_CCFLAGS) $(INCDIRS) $(AIDE_INCDIRS) $(PYTHON_INCDIRS) $*.C \
	   -o $@ $(LIBDIRS) $(AIDE_LIBDIRS) $(AIDE_LIBS) $(LIBS) 

else
build_cpp:
endif
else
build_cpp:
endif

## Build gyp-file commands

ifeq (true,$(call getpackagevalue,gypfile))

build_gyp: ../.build_gyp_done

../.build_gyp_done: $(wildcard ../node_modules/.lib/*.a)
ifneq (,$(PYTHON_LIB))
	@cd .. ; cp binding.gyp binding.gyp~ ; sed  's/"-lpython[0-9.]*"/"$(PYTHON_LIB)"/' < binding.gyp~ > binding.gyp
endif
	@cd .. ; node-gyp rebuild --silent | grep -E -v '(CXX|SOLINK_MODULE).target.|COPY'
	@mkdir -p $(@D) ; touch $@

else
build_gyp:
endif

## Build swig python wrapper commands

ifeq (true,$(call getpackagevalue,swig))
ifneq (,$(shell which swig 2>/dev/null))

### Python wrapper compilation variables

##### C/C++ compilation commans
PY_CXX      = c++
PY_CCFLAGS  = -I. -Wno-deprecated-declarations -std=c++17
PY_CCFLAGS += $(PYTHON_INCDIRS)
##### Collect all dependencies
PY_DEPS     = $(wildcard ../node_modules/*/src)
PY_CCFLAGS += $(patsubst %, -I%,$(PY_DEPS))
PY_HPP     += $(wildcard *.hpp ../node_modules/*/src/*.hpp)
PY_CPP      = $(wildcard *.cpp ../node_modules/*/src/*.cpp)
##### All used libraries
PY_LDFLAGS  = -lstdc++ -lcurl -lm
##### The python target directory and python pat
export PYTHONPATH = ../node_modules/python/site-packages
##### The python command
PYTHON_COMMAND = python3

build_python: build_mpl ../node_modules/python/site-packages/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).py

../node_modules/python/site-packages/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).py : $(PY_HPP) $(PY_CPP)
#####	echo 'Building $@ from $(PY_HPP) and $(PY_CPP)'
##### Prepares the build folder
	@/bin/rm -rf $(PYTHONPATH)/$(AIDE_PACKAGE_NAME) ; mkdir -p $(PYTHONPATH)/$(AIDE_PACKAGE_NAME) 
##### Builds the swig wrapping include file
	@(echo "%module $(AIDE_PACKAGE_NAME)"; echo "%{"; for f in $(PY_HPP); do echo "#include \"$$f\""; done; echo "%}" ; echo '%include "std_string.i"'; for f in $(PY_HPP); do echo "%include \"$$f\""; done) > $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).i
##### Builds the python *.py and *.so module files
	swig -module $(AIDE_PACKAGE_NAME) -c++ -python -o $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).C $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).i
	$(PY_CXX) $(CCFLAGS) $(PY_CCFLAGS) -fPIC -c $(PY_INC) $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).C $(PY_CPP)
	$(PY_CXX) -shared -o $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/_$(AIDE_PACKAGE_NAME).so *.o $(LIBS) $(PY_LDFLAGS)
	@cp $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/$(AIDE_PACKAGE_NAME).py $(PYTHONPATH)/$(AIDE_PACKAGE_NAME)/__init__.py
	@chmod -R a+rx $(PYTHONPATH)
##### Cleans compilation files
	@/bin/rm -f *.o

else
build_python:
endif
else
build_python:
endif

# Test commands

## Test environment variables

export PATH += :$(AIDE_NODE_MODULES_DIR)/.bin

##### Here constructs the library path from the -L elements
EMPTY=
SPACE=$(EMPTY) $(EMPTY)
export LD_LIBRARY_PATH = $(subst $(SPACE),:,$(patsubst -L%,%,$(AIDE_LIBDIRS) $(LIBDIRS)))

ifeq (,$(MAIN))
MAIN = test
ALLTESTS = true
endif

TESTBIN = ../node_modules/.bin/$(MAIN)

ifeq (true,$(VERBOSE))
SAYTEST.SH = >&2 echo 'make info { running: test.sh }' ;
SAYTEST.BIN = >&2 echo 'make info { running: $(TESTBIN) }' ;
SAYTEST.JS = >&2 echo 'make info { running: test.js }' ;
SAYTEST.PY = >&2 echo 'make info { running: test.py }' ;
SAYTEST.MPL = >&2 echo 'make info { running: test.mpl }' ;
SAYTEST.MAKE = >&2 echo 'make info { running: \'make $(TEST)\' }' ;
endif

## Test run commands

test:
ifeq (,$(ALLTESTS))
	@$(SAYTEST.BIN) $(TESTBIN) $(ARGV)
else
	@if [ -f test.sh ] ; then chmod a+rx test.sh   ; $(SAYTEST.SH) ./test.sh $(ARGV) ; fi
	@if [ -f test.C  ] ; then $(MAKE) build_cpp    ; $(SAYTEST.BIN) $(TESTBIN) $(ARGV) ; fi
	@if [ -f test.js ] ; then chmod a+rx test.js   ; $(SAYTEST.JS) ./test.js $(ARGV) ; fi
ifneq (,$(shell which swig 2>/dev/null))
	@if [ -f test.py ] ; then $(MAKE) build_python ; $(SAYTEST.PY) $(PYTHON_COMMAND) test.py ; fi
endif
	@if [ -f test.mpl -a \! -z "`which maple 2>/dev/null`" ] ; then $(SAYTEST.MPL) $(MAKE) build_mpl ; $(call maple,test.mpl) ; fi
ifneq (,$(TEST))
	@$(SAYTEST.MAKE) $(MAKE) $(TEST)
endif
endif

gtest: build_cpp
	@unset DEBUGINFOD_URLS ; (echo "break exit" ; echo "run $(ARGV)" ; echo "echo --- backtrace ------------------------------------------------------------------------------\n"; echo "backtrace" ; echo "echo --- backtrace full -------------------------------------------------------------------------\n" ; echo "backtrace full"; echo "quit 0") > /tmp/a.cmd ; gdb -n -q $(TESTBIN) -x /tmp/a.cmd --return-child-result 2>&1 ; ok=

vtest: build_cpp
	@ulimit -s 100000 2>/dev/null ; export GLIBCXX_FORCE_NEW=1; valgrind --max-stackframe=100000000 --track-origins=yes $(TESTBIN) $(ARGV)

## Build public files command

AIDE_PACKAGE_PUBLIC_DIR = ../public

.PHONY: _beautify

build_public: build_mpl _beautify  $(patsubst %.js,$(AIDE_PACKAGE_PUBLIC_DIR)/%.js, $(filter-out test.js, $(wildcard *.js))) $(patsubst %.css,$(AIDE_PACKAGE_PUBLIC_DIR)/%.css, $(wildcard *.css)) ../README.md $(AIDE_PACKAGE_PUBLIC_DIR)/index.html

### Reformats .js .css .hpp .cpp files in order to have a standard format

_beautify:
	@for f in $(wildcard *.js) ; do cp -p $$f $$f~ ; touch $$f~ -r $$f ; js-beautify -q -s 2 -n -r $$f ; touch $$f -r $$f~ ; done
	@for f in $(wildcard *.css) ; do cp -p $$f $$f~ ; touch $$f~ -r $$f ; css-beautify -q -s 2 -n -r $$f ; touch $$f -r $$f~ ; done
	@if which uncrustify >/dev/null 2>&1 ; then for f in $(wildcard *.hpp) $(wildcard *.cpp) $(wildcard *.C) ; do cp -p $$f $$f~ ; touch $$f~ -r $$f ; uncrustify -q -c ../node_modules/aidebuild/src/uncrustify.cfg -f $$f~ -o $$f ; touch $$f -r $$f~ ; done ; fi

### Generates public versions of the files

$(AIDE_PACKAGE_PUBLIC_DIR)/%.js: ./%.js
	@mkdir -p $(@D)
	@uglifyjs $^ -c -m toplevel=true > $@
	@chmod a+rx $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.css: ./%.css
	@mkdir -p $(@D)
	@tr "\n" " " < $^ | sed 's/\/\*[^\*]*\*\///g' | sed 's/  */ /g' | sed 's/ *\([:;{}]\) */\1/g' > $@

### Builds the readme

../README.md: ../package.json $(wildcard introduction.md)
	@cd .. ; $(AIDE_NODE_MODULES_DIR)/aidebuild/public/make-readme.js
	@git add $@

### Builds index.thml and related files

DOC_FILES = \
 $(patsubst %.html,$(AIDE_PACKAGE_PUBLIC_DIR)/%.html, $(filter-out index.html, $(filter-out test.html,$(wildcard *.html)))) \
 $(patsubst %.png,$(AIDE_PACKAGE_PUBLIC_DIR)/%.png, $(wildcard *.png)) \
 $(patsubst %.jpg,$(AIDE_PACKAGE_PUBLIC_DIR)/%.jpg, $(wildcard *.jpg)) \
 $(patsubst %.gif,$(AIDE_PACKAGE_PUBLIC_DIR)/%.png, $(wildcard *.gif)) \
 $(patsubst %.odg,$(AIDE_PACKAGE_PUBLIC_DIR)/%.png, $(wildcard *.odg)) \
 $(patsubst %.bib,$(AIDE_PACKAGE_PUBLIC_DIR)/%.bib, $(wildcard *.bib)) \
 $(patsubst %.sh,$(AIDE_PACKAGE_PUBLIC_DIR)/%.sh, $(wildcard *.sh)) \
 $(patsubst %.inc.tex,$(AIDE_PACKAGE_PUBLIC_DIR)/%.inc.tex, $(wildcard *.inc.tex)) \
 $(patsubst %.tex,$(AIDE_PACKAGE_PUBLIC_DIR)/%.tex, $(wildcard [A-Za-z]*.tex)) \
 $(patsubst %.tex,$(AIDE_PACKAGE_PUBLIC_DIR)/%.pdf, $(wildcard [A-Za-z]*.tex))

$(AIDE_PACKAGE_PUBLIC_DIR)/index.html: $(wildcard introduction.md) $(wildcard *.hpp) $(wildcard *.js) $(wildcard *.sh) $(DOC_FILES)
	@echo '/** */' > ./.jsdoc2_header.js # added to run jsdoc even if no .js file but only .sh or .hpp
	@node ../node_modules/aidebuild/src/jsdoc2/jsdoc2_readme.js < ../README.md > ../README.md~
	@../node_modules/.bin/jsdoc -c $(AIDE_NODE_MODULES_DIR)/aidebuild/src/jsdoc_config.json -t ../node_modules/jsdoc2 -R ../README.md~ -d $(AIDE_PACKAGE_PUBLIC_DIR) ./.jsdoc2_header.js $(sort $(wildcard *.js))
	@rm ./.jsdoc2_header.js
ifneq (,$(shell which linkchecker 2>/dev/null))
	@if [ -z "`linkchecker -ocsv https://gitlab.inria.fr/line/aide-group 2>&1 | grep ConnectionError`" ] ;\
        then \
	  cd ../public; linkchecker --check-extern --no-warning -ocsv *.html 2> /dev/null | grep 'ConnectionError' | sed 's/^\([^;]*\);\([^;]*\);.*/Broken link "\1" in "\2"/' ;\
        fi
endif
	@git add $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.html : ./%.html
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.png : ./%.png
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.jpg : ./%.jpg
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.gif : ./%.gif
	@mkdir -p $(@D) ; cp -p $^ $@

ifneq (,$(shell which libreoffice 2>/dev/null))
$(AIDE_PACKAGE_PUBLIC_DIR)/%.png : %.odg
	@libreoffice --headless --convert-to png --outdir $(@D) $^
endif

ifneq (,$(shell which pdflatex 2>/dev/null))
$(AIDE_PACKAGE_PUBLIC_DIR)/%.pdf : $(AIDE_PACKAGE_PUBLIC_DIR)/%.tex
	@mkdir -p $(@D) ; cp -p $^ $@
	@-cd $(@D) ; pdflatex $* ; bibtex $* ; pdflatex $* ; pdflatex $* ; rm -f *.aux $*.toc $*.blg $*.bbl $*.out $*.log
endif

$(AIDE_PACKAGE_PUBLIC_DIR)/%.sh : ./%.sh
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.bib : ./%.bib
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.inc.tex : ./%.inc.tex
	@mkdir -p $(@D) ; cp -p $^ $@

$(AIDE_PACKAGE_PUBLIC_DIR)/%.tex : %.tex
	@(cat ../node_modules/aidebuild/src/tex/preamble.tex ;\
	 echo -E '\begin{document}' ;\
	 cat $^ ;\
	 if grep '\\cite{' $^ > /dev/null ;\
	 then \
	   echo -n -E '\newpage {\scriptsize \bibliographystyle{apalike}\bibliography{' ;\
	   for f in $(wildcard *.bib) ;\
	   do echo -n "$$f," ;\
	   done ;\
	   echo -E '}' ;\
	 fi ;\
	 echo -E '\end{document}') > $@

# Installation and synchronization commands

install:
ifneq (aidebuild,$(AIDE_PACKAGE_NAME))
	@wget -q https://gitlab.inria.fr/line/aide-group/aidebuild/-/raw/master/src/makefile -O ./.makefile.inc
endif
	@if [ -f install.sh ] ; then bash -e ./install.sh ; fi
ifneq (,$(INSTALL))
	@$(MAKE) $(INSTALL)
endif

sync:
	@cd .. ; find -name '*~' -delete
# Sync with git
	@(git pull -q ; git commit -q -a -m 'sync from makefile' ; git push -q) 2>&1 | grep -E -v '^(remote:|On branch master|Your branch is up to date|nothing to commit|^.*$$)' ; git status -s
# Sync with npmjs if required
ifeq (true,$(call getpackagevalue,npmjs))
	@cd .. ;\
	  version="`wget -q --output-document - https://registry.npmjs.org/$(AIDE_PACKAGE_NAME) | sed 's/.*\"latest\": *\"\([^\"]*\).*/\1\n/'`" ;\
	  local_version="$(call getpackagevalue,version)" ;\
	  if   [ -z "$$version" ] ;\
	  then echo "$(AIDE_PACKAGE_NAME) is not registered on npmjs, 'npm publish' will do it" ;\
	  elif [ "$$version" = "$$local_version" ] ;\
          then echo "$(AIDE_PACKAGE_NAME), version $$local_version is up to date on npmjs" ;\
	  else echo "$(AIDE_PACKAGE_NAME), local-version: $$local_version != npmjs-version: $$version, 'npm publish' is to be run" ;\
	  fi
endif

ifeq (true,$(VERBOSE))
# See : https://dev.to/matheusabr/enhance-your-npm-installations-with-loglevel-26cc
NPMLOGLEVEL = info
NPMGREP     = | grep -v -E '(^($$|>|npm (info (ok|using)|http fetch (GET|POST) 200)))|packages are looking for funding|run .npm fund. for details|added [0-9]* packages, and audited [0-9]* packages in [0-9]*s|make -s --no-print-directory -C src|target: *._concatenate_libs.'
else
NPMLOGLEVEL = warning
NPMGREP     = | grep -E '^npm (error|warning)'
endif

rebuild:
	@($(MAKE) clean ; pushd .. > /dev/null ; npm --loglevel $(NPMLOGLEVEL) install ; popd > /dev/null ; $(MAKE) build ; $(MAKE) test) 2>&1 $(NPMGREP) ; ok=

clean:
	@cd .. ; /bin/rm -rf node_modules .build* package-lock.json README.md public/index.html src/{*.o,nohup.out,menu.log}; find . -name '*~' -delete
ifneq (,$(CLEAN))
	@if [ -f clean.sh ] ; then bash -e ./clean.sh ; fi
	@$(MAKE) $(CLEAN)
endif

show:
	@$(BROWSER) ../public/index.html

##### end of makefile
