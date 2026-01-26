# Codex Working Prompt

Read `SPECS.md`, `CODING_RULES.md`, and `TASKS.md` for overall context.

CURRENT_TASK.md is the source of truth.
If CURRENT_TASK.md exists, ignore TASKS.md except for background context.

Operating rules:
1. Read CURRENT_TASK.md and implement ONLY what is described there.
2. Modify ONLY files explicitly allowed by CURRENT_TASK.md, plus:
   - any files under `tests/**`
3. Add or update tests so the task is fully covered and deterministic.
4. Do NOT implement future tasks, endpoints, or features.
5. Do NOT refactor unrelated code.
6. Keep changes minimal, focused, and readable.
7. If requirements are unclear, STOP and ask instead of guessing.
8. Ensure `npm test` passes before finishing.

Output format:
- Short summary of what was implemented
- List of files changed or added
- Exact commands to run tests
- Any assumptions made (should be rare due to SPECS.md)
