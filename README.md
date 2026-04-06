<p align="center"> 
	<br/>
		<a href="https://opensource.org/license/gpl-3-0"><img src="https://img.shields.io/badge/License-GPL_v3-blue.svg?color=3F51B5&style=for-the-badge&label=License&logoColor=000000&labelColor=ececec" alt="License: GPLv3"></a>
		<img src="https://img.shields.io/badge/Status-Early%20Development-orange?style=for-the-badge" alt="Project status: Early development">
	<br/>
</p>

# CaseShelf
A management and organisation tool to help you catalogue your physical media collection.

## Features
- Add, edit and remove items in your physical media collection

## Tech stack
- Next.js
- PostgreSQL

## Installation
### Docker
1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your values
3. Run `docker compose up -d`
4. Open `http://localhost:3000`

### Standalone
Prerequisites: Node.js and PostgreSQL installed and running

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your values
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://localhost:3000`

### Environment variables
| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database hostname (use `db` for Docker, `localhost` for standalone) |
| `DB_PORT` | Database port (default: `5432`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |

## Roadmap
- [x] ~~Item management~~
- [ ] Import/export via CSV
- [ ] Metadata scraping via external APIs
- [ ] Library organisation tools
- [ ] Mobile UI improvements
- [ ] Multi-user support and OAuth
- [ ] Support for more media types (books, manga, vinyl, etc.)
- [ ] Mobile app

## Contributing

Contributions are welcome. Whether it’s bug fixes, features, documentation, or ideas, I’d love your help. This isn’t limited to developers — reporting bugs, suggesting features, or improving documentation are all appreciated.

For substantial changes, please open an issue first to discuss what you’d like to do. This helps avoid duplicated work and keeps things aligned with the project’s direction.

### For developers
- Create a branch using the format `type/your-change`
  - Accepted types: `feature`, `bug`, `refactor`
- Keep commit messages clear and descriptive
- Open a pull request and reference any relevant issues

I’ll do my best to stay on top of requests, but I’m a solo developer working on this in my free time, so responses may not always be immediate. Thanks in advance for any contributions.

## AI-assisted contributions

AI tools (e.g. code assistants, LLMs) are allowed, but should be used responsibly. If your contribution involves AI:

- Declare it in your pull request and briefly explain how it was used
- Make sure you understand the code you submit, and can explain the reasoning behind it

### Expectations
- Contributions should be clear, reviewable, and well explained
- Prefer small, incremental changes over large AI-generated patches
- Code that cannot be reasonably reviewed or explained is unlikely to be accepted

Low-effort or unreviewed AI-generated code (“vibe coding”) will not be accepted. When in doubt, keep changes simple, focused, and well understood.

## Licence

This project is licensed under the GNU General Public Licence v3.0 (GPLv3) — see the [LICENSE](./LICENSE) file for details.
