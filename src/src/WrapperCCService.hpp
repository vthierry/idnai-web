#ifndef __WrapperCCService__
#define __WrapperCCService__

#include <map>
#include <string>

/**
 * @function wrap
 * @static
 * @virtual
 * @description This is the C/C++ Javascript wrapping mechanism to be implemented.
 *
 * - The architecture is based on a local node.js server,
 *   - The wrapping uses the [node-addon-api](https://github.com/nodejs/node-addon-examples) mechanism.
 *   - It is built using the [gyp binding](https://gyp.gsrc.io/docs/UserDocumentation.md) framework.
 *
 *  - In order to implement a C/C++ wrapping mechanism is implemented in a `wrap.cpp` file in the `./src` directory a function of the form:
 *
 * ```
 * #include <WrapperCCService.hpp>
 *
 * std::string wrap(const std::map < std::string, std::string >& query)
 * {
 *   if(what_is_to_be_done_is_defined_()) {
 *     return let_us_do_it_and_return_the_result();
 *   } else {
 *     // Returns a standard error message, using the nowrap utility function
 *     return nowrap(query);
 *   }
 * }
 * ```
 * @param {map} query A `std::map < std::string, std::string >` with the `name=value&...` input query.
 * @return {string} The wrapper answer as a string, parsing to a JSON string.
 */
std::string wrap(const std::map < std::string, std::string > &query);

std::string nowrap(const std::map < std::string, std::string > &query);

#endif
