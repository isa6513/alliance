Git diff:
If the user specifies a specific commit (e.g. `HEAD~2` or `a1b2c3`), then run `git diff {specified_commit}`.
If the user specifies two specific commits (e.g. "from a1b2c3 to e4f506"), then run `git diff {commit1} {commit2}`.
If the user did not specify any commits, run `git diff HEAD`. If it is empty, then check `git diff HEAD~1 HEAD`.

Review only this patch in the context of the repo.

Review only the changes introduced by the most recent commit.
Suggest any improvements, potential bugs, or issues. Attend to high level direction also, such as if there might be a better way to accomplish the same objective.

Output a final message with your concise thoughts. Do not summarize the commit, just write one short bullet point for each specific issue you found, if any. Do not list things that do not need fixing. End the message with the phrase "[NEEDS_ATTENTION]" if there is a significant issue or possible improvement that the author should address. If everything is fine, do not include this phrase.
Only output [NEEDS_ATTENTION] if you are highly confident there is a substantial issue. Look around at related files to make sure you aren't missing anything before doing so. If the changes remove a feature or affordance but this removal was clearly intentional by the author, this does not need attention. Do not leave comments of the form "verify that x" or "x needs to be tested" - these are not code issues. Include full file paths from repository root as well as line numbers for applicable issues in your review.
This is a WIP feature branch, do not comment on unimplemented features or clearly in-progress areas.
