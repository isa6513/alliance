read @DTO_AUDIT_TODO.md

complete all items in the first uncompleted Dto section (starting with ###)

if we remove the object.assign, make sure no consumers actually use any of the unlisted fields from Object.assign (e.g. some client casting with `as xxx` and then pulling out one of the fields that used to be assigned but is no longer assigned). i.e. make sure none of the features of the site break, it should be a no-op wrt the app (api change is ok, we don't officially support a public api)
