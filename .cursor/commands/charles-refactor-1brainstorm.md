do a git diff HEAD~1 and then brainstorm how to increase the code quality if possible (shared components, helper functions, more extensibility, etc)
also, specifically for this commit, look for inconsistent styling (for example, colors, border sizes, font sizes, etc) and try and use the "standard" styling (insofar as there is a standard within the codebase) it's ok to change how it looks for the sake of consistency. consistency across the site is more important (i.e. stuff in web should look like other stuff in web and same applies to mobile, but it's ok for web and mobile to look different)
also, don't overdo it and create things just for the sake of reuse. it should be in general "good" code, (whatever that means, use your own judgment)
performance improvements are always welcome (of course don't make the code too complex to this, but low hanging fruit is good)
remember this is only a brainstorm, don't actually change any files
