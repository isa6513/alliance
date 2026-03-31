Git diff:
If the user specifies a specific commit (e.g. `HEAD~2` or `a1b2c3`), then run `git diff {specified_commit}`.
If the user specifies two specific commits (e.g. "from a1b2c3 to e4f506"), then run `git diff {commit1} {commit2}`.
If the user did not specify any commits, run `git diff HEAD`. If it is empty, then check `git diff HEAD~1 HEAD`.

Brainstorm how to increase the code quality if possible (shared components, helper functions, more extensibility, etc)

Specifically for this commit, look for inconsistent styling (for example, colors, border sizes, font sizes, etc) and try and use the "standard" styling (insofar as there is a standard within the codebase) it's ok to change how it looks for the sake of consistency. consistency across the site is more important (i.e. stuff in web should look like other stuff in web and same applies to mobile, but it's ok for web and mobile to look different)

Don't overdo it and create things just for the sake of reuse. it should be in general "good" code, (whatever that means, use your own judgment)
Performance improvements are always welcome (of course don't make the code too complex to this, but low hanging fruit is good)

Remember this is only a brainstorm, don't actually change any files.
