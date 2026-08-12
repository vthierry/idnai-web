#include <napi.h>

#include <WrapperCCService.hpp>

std::string nowrap(const std::map < std::string, std::string > &query)
{
  std::string string = "";
  for(auto item : query) {
    string += (string == "" ? "" : "&") + item.first + "=" + item.second;
  }
  return "{ \"error\": \"wrong or unimplemented query\", \"query\": \"" + string + "\" }";
}
// Implements the wrapping mechanism of the wrap() function
Napi::String NapiWrapperMethod(const Napi::CallbackInfo& info)
{
  std::map < std::string, std::string > query;
  {
    Napi::Object values = info[0].As < Napi::Object > ();
    Napi::Array names = values.GetPropertyNames();
    for(unsigned int i = 0; i < names.Length(); i++) {
      std::string name = names.Get(i).As < Napi::String > ().Utf8Value();
      query[name] = values.Get(names.Get(i)).As < Napi::String > ().Utf8Value();
    }
  }
  Napi::String res = Napi::String::New(info.Env(), wrap(query));
  return res;
}
// Registers the wrapping mechanism of the C wrap() function as a `wrap` JS function
Napi::Object NapiWrapperInit(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "wrap"), Napi::Function::New(env, NapiWrapperMethod));
  return exports;
}
// Registers the binding as a `wrapper` module
NODE_API_MODULE(wrapper, NapiWrapperInit)
