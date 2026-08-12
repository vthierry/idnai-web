/** Defines a remamence mechanism for a HTML form.
 * - This mechanism allows a HTML form data to be remament, i.e., saved and reloaded, using the construct:
 * ```
 *   <script type='text/javascript' src='.../aideweb.js'></script>
 *   <script>var remanentForm = new RemanentForm("$url", "$slug", "$index", save_callback, load_callback);</script> 
 *   <!--- where $slug, $index are user choosen names, $url is the persistant data service url -->
 *   <form id='$slug'>
 *     <input name='$index' type='text' required/> 
 *       <a onclick='remanentForm.load("$slug")'>Load the data</a>
 *     <!--- other form input --->
 *     <input type='submit'>Save the data</input>
 *   </form>
 * ```
 * - On submit, the form data is stored in a $slug-$index.value JSON file via the persistant data service.
 * - When remanentFormLoad is called, the data, if predefined, is loaded.
 * - The form data can also be preloaded by providing the values in the url query.
 * - Here we do NOT want the input data to be treated by a action='' attribute since it is managed via this mechanism.
 * Remark:
 * - The present mechanism is designed for any textual (e.g., 'text'), 'radio', and 'checkbox' input type, only.
 * @param {string} url The persistant data service URL.
 * @param {string} slug The form ID, also used as the form JSON file prefix.
 * @param {string} index The form 'index' input name (e.g., user email), used as unique identifier of the form data.
 * @param {callback} save_callback Callback function called when the data is saved.
 * - Runs the <tt>callback()</tt> function after the value is saved.
 * @param {callback} load_classback Callback function called when the data is loaded.
 * - Runs the <tt>callback(value: object)</tt> function with the loaded value.
 * @class
 */
const RemanentForm = function(url, slug, index,
  save_callback = function() {}, load_callback = function() {}) {
  var persistantData = new PersistantData(url);
  // Converts values {name: value , ...} to inputs [[name, value], ...]
  const values2inputs = function(values) {
    let inputs = [];
    for (let name in values) {
      inputs.push([name, values[name]]);
    }
    return inputs
  };
  // Converts inputs [[name, value], ...] to values a {name: value , ...}
  const inputs2values = function(inputs) {
    values = {};
    for (let entry of inputs) {
      if (entry[0] in values) {
        values[entry[0]] += ',' + entry[1];
      } else {
        values[entry[0]] = entry[1];
      }
    }
    return values;
  };
  // Loads the input values in form inputs of given names
  const loadForm = function(inputs) {
    // Sets the form input value accordingly
    for (let item of inputs) {
      let name = item[0],
        values = [item[1]];
      if (values[0].includes(',')) {
        values = values[0].split(',');
      }
      try {
        if (document.getElementsByName(name)[0].type == "radio" || document.getElementsByName(name)[0].type == "checkbox") {
          for (let i = 0; i < document.getElementsByName(name).length; i++) {
            for (value of values) {
              if (value == document.getElementsByName(name)[i].value) {
                document.getElementsByName(name)[i].checked = true;
              }
            }
          }
        } else {
          document.getElementsByName(name)[0].value = values[0];
        }
      } catch (e) {
        // Silently catch errors if the inputs name is undefined.
      }
    }
  };
  // Implements the submit event
  const onSubmit = function(event) {
    // Retrieves the form values, and converts 
    let values = inputs2values(new FormData(document.getElementById(slug)));
    // Saves the values if the index is well defined
    if (values[index] != undefined && values[index] != "") {
      persistantData.saveJSON(slug + "-" + values[index], values, true, save_callback);
    }
    // Here we do NOT want the form to be treated by an action attribute of so.
    event.preventDefault();
  };
  // Install the submit and preload event
  try {
    document.getElementById(slug).addEventListener("submit", onSubmit, true);
    // Preloads from the URL query values
    loadForm(new URLSearchParams(window.location.search.substring(1)));
  } catch (e) {
    console.log("RemamentForm error: The form slug ID '" + slug + "' corresponds to an undefined form");
    console.log(e);
  }
  /** Preloads the data in the remamence mechanism for a HTML form.
   * @param {string} slug The form ID, also used as the form JSON file prefix.
   */
  this.load = function() {
    try {
      // Retrieves the values JSON file
      let key = document.getElementsByName(index)[0].value,
        values = {};
      if (key != "") {
        values[index] = key;
        persistantData.loadJSON(slug + "-" + key, values, function(values) {
          loadForm(values2inputs(values));
          load_callback(values);
        });
      }
    } catch (e) {
      console.log("RemamentForm error: The form index ID '" + index + "' corresponds to an undefined input field");
    }
  };
};
