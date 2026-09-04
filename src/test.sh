#!/bib/bash

# Compiles C/C++ if needed
$(MAKE) -C .. BUILD_CPP

# Starts the three program in background
test.js -go &
python3 test.py -go &
../.bin/test -go &

# Opens the web page

$(BROWSER) test.html




