/** Sets all strings of the page given a dictionary.
 *
 * - In order to define a multi-language HTML page, 
 *   - all strings are defined in an external dictionary
 *   - and indexed by a slug in the HTML page.
 *
 * - By multi-language we consider
 *   - different country languages (e.g., Hindi or Thai) or 
 *   - target adapted text (e.g. for kids or elder).
 *
 * # Defining the slug -> string mapping
 *
 * - The _external dictionary_ is a Javascript file defining the `slug -> string` mapping.
 *   - This file contains all the  strings of the web site:
 * ```
 * const dictionary = {
 *   // Defines the "$slug" : "$string" mapping.
 *   "page-title" : "Title of the page",
 *   ../..
 * };
 * ```
 * This file is called `dictionary.js` in the sequel.
 *
 * # Using the slug -> string mechanism in a HTML page
 *
 * - In the page, each string is defined by its slug (notice the ``.´´ in the tag content to avoid empty tags), e.g.:
 * ```
 *    <span data-slug='$slug'>.</span>
 * ```
 * - This can be applied to the `<span...`, `<a...`, `<h1...`, `<h2...`, `<h3...`, `<h4...`, `<span...`, `<label...`, `<input...`, `<button...`, `<option...`,`<p...`,
 *
 * - The following construct, usually at the end of the HTML page, fills the strings:
 * ```
 *   <!-- Loads the slugstring mechanism, ".../" is the file directory -->
 *   <script src="https://line.gitlabpages.inria.fr/aide-group/slugstring/slugstring.js"></script>
 *   <!-- Loads the slug -> string dictionary of this page, ".../" is the file directory -->
 *   <script src=".../dictionnary.js"></script>
 *   <!-- Fills all string, this is to be called AFTER the HTML tags definition -->
 *   <script>slugstring.fill(dictionnary);</script>
 * ```
 * We may also use the construct: 
 *
 * `<body onload="slugstring.fill(dictionary)">`
 *
 * to fill the string immediately after the page has been loaded.
 *
 * ## Testing the mechanism
 *
 * - Opening the [_test.html](https://gitlab.inria.fr/line/aide-group/slugstring/-/blob/master/src/_test.html) file allows to both run a test and have a complete example. 
 *
 * # Managing several languages in the same page
 * 
 * Considering several languages dictionaries assembled in a data structure of the form
 * ```
 * const dictionaries = {
 *   // Defines the "$lang" : "$dictionary" mapping.
 *   "fr.slang" : fr_slang_dictionary,
 *   "fr.fr"    : fr_fr_dictionary,
 *   ../..
 * };
 * ```
 * the `slugstring.fill(dictionaries[lang])` construct allows to parameterized the string setting.
 *
 * For instance:
 *
 * 1. The language is defined in the 
 * <center><tt>&lt;html lang="fr.slang"></tt></center>
 * HTML document first line, thus 
 * <center><tt>lang = document.documentElement.lang</tt>.</center>
 *
 * 2. The language can be given via the page URL query, e.g., something like 
 * <center><tt>http://page-url?lang=fr.slang</tt>,</center>
 * thus can be retrieved using:
 * <center><tt>lang=new URLSearchParams(window.location.search).get("lang")</tt>.</center>
 *
 * @class
 */
var slugstring = {
  /** Fills the HTML strings defined by slugs.
   * @static
   * @param {map<string,string>} dictionary The `{ "slug" : "string", ... }` mapping.
   */
  fill: function(dictionary) {
    const tagNames = ["span", "a", "h1", "h2", "h3", "h4", "label", "input", "button", "option", "p"];
    for (let i in tagNames) {
      let tags = document.getElementsByTagName(tagNames[i]);
      for (let tag in tags) {
        if (tags[tag].getAttribute != undefined) {
          let slug = tags[tag].getAttribute("data-slug");
          if (slug != undefined && dictionary[slug] != undefined) {
            tags[tag].innerHTML = dictionary[slug];
          }
        }
      }
    }
  }
};
