<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Detection logic lives in `src/engines/` (pure TS, evidence-first); API routes under `src/routes/api/` only validate input and call engines — so ML models can plug in via `engines/models.ts` without frontend changes.
- Check history is stored in browser localStorage per anonymous session (`src/services/history.ts`) — privacy-first; raw inputs saved only on explicit opt-in.
- Never fetch or open user-submitted URLs server- or client-side; analysis is static.
