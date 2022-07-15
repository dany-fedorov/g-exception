# GException

## Principles

- Nothing ever throws inside GException code.
- All exceptions inside GException code should be reported with a warning and recorded in the body of GException
  instance.
- Be not afraid of feature bloat before 1.0.0. Make the best guess about useful pattern and throw it in.
- Be not afraid to remove a feature before 1.0.0. If something is proven to be not useful or not accepted/not understood
  , then throw it away.
- Every behaviour is configurable with sane defaults. Global config object is the same as instance config object.
- Zero compromises on code quality of what goes into 1.0.0. Be not afraid to "overengineer".
- Unit-test Everything.
- Near >95% coverage for all versions.
- Most documentation is inlined. Inline documentation should be enough to understand all APIs.

## Plan for 1.0.0

- `serializeException` function. Takes an "unknown" that was thrown (but is tailored towards Error and GException) and
  serializes it to a list of predefined formats. Only two formats for 1.0.0 - JSON and a friendly but parseable inline
  format. (Check
  out https://github.com/terrymorse58/serialize-anything, also check Jest snapshots)
- `dserializeException` function.
- Configuration option for callback that fires on GException construction and can modify the object. Anticipated usage:
  add server context, request context to `info` using AsyncLocalStorage.
- Configuration option to set current environment name and to configure which fields should be serialized and which
  should not. I imagine something like env + context should decide if to include the field. E.g. "prod" env + "
  http_response" context - hide some fields like stacktrace, "prod" env + "internal_logs" context - allow all fields.
- Tested and integrated with live server before 1.0.0. Current plan for integration context: REST API on NestJS +
  logging to AWS CloudWatch.
- Make documentation

## TODO

- Come up with a test where error happens inside handlebars library.

## TBD

- Maybe remove `getStack()` method, because handlebars syntax might be applied to stacktrace entries.
- Should the current config object be attached to each instance? In case global config changes.

## Ideas Backlog

- Web UI to deserialize exception?
- Support rich formatting for error messages? With like tables and CSS? Or maybe add HTML format to `serializeException`
  ?
- Think about integrations with frameworks/services or logging libraries. 
