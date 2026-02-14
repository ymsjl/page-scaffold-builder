# Copilot Instructions

Follow these rules when generating code for this repo (apps/web scope):

- Use TypeScript and React 18. Prefer function components.
- Follow Airbnb + Prettier rules configured in this repo.
- Prefer named exports; avoid default exports unless already used in the file.
- Use type-only imports where possible and keep imports sorted.
- Do not disable ESLint rules unless absolutely necessary; explain why if you must.
- Prefer explicit types for public APIs and exported functions.
- Keep components small and focused; extract logic into hooks when it improves clarity.
- Avoid introducing new dependencies without asking.

When unsure, align with existing code style in apps/web.
