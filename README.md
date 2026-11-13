# McFlow AI Workspace

Build a modern, responsive SaaS web app called "MacFlow" (tagline: "Work smart, stay chilled.") for professionals. Keep the code compact. No login, no registration, no database; nothing is saved beyond the browser tab.

Layout: dashboard with collapsible sidebar (Email, Research, Meetings), input and output sections on each page, theme toggle, bottom tab bar on mobile.

All outputs must be real AI-generated responses using Lovable AI, based on the user's actual input. No canned or generic text. Show loading, error and empty states.

1. Smart Email Generator: inputs for recipient, audience (client / manager / team), key points, length (Short / Medium); tone selector (Formal / Friendly / Persuasive). Output subject and body, editable, with Copy, Regenerate and tone switch.

2. AI Research Assistant: input a topic, pasted article or URL. Output Summary, Key Insights, Recommendations, editable, with "Copy as notes". If a URL can't be read, say so and ask the user to paste the text; never invent page contents.

3. Meeting Notes Summarizer: paste notes, choose Brief or Detailed. Output Summary, Key Decisions, Action Items (task, owner, deadline) and Deadlines. Use "Not specified" for anything missing; never invent items. Editable, with Copy and a "Draft follow-up email" button that opens the Email page prefilled.

Design: clean, modern, professional. Warm ivory and deep green with one vermilion accent (#E8553D), serif headings, no purple gradients.

Responsible AI: first-use disclaimer dialog and a sidebar card: "AI can make mistakes. Review before use. Don't enter sensitive data. Nothing is saved." Label every output "AI-generated · editable".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mcflow-assistant.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c233f56-bdec-4b29-b198-859e82b1eadc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
