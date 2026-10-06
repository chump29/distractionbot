# ![DistractionBot](./utils/images/distractionbot.webp) DistractionBot

> - DistractionBot for Discord

---

![Bun](https://img.shields.io/badge/Bun-1.4.2-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-^14.27.0-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-1.0.0--rc.4-informational?style=plastic&logo=drizzle) &nbsp;
![SQLite](https://img.shields.io/badge/SQLite-3.49.2-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/chump29/distractionbot/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-88.11%25-success?style=plastic&logo=jest)

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/chump29/distractionbot?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")

---

### What it does: <!-- markdownlint-disable-line MD001 -->

- Generates distractions from a craving

---

### 🔗 Invite Link <!-- markdownlint-disable-line MD001 -->

[Add DistractionBot](https://discord.com/oauth2/authorize?client_id=1500816494785855488&permissions=0&integration_type=0&scope=bot)

---

### 🖥️ Discord

#### Role Permissions:

| ⚙️ Permission |
|:-------------:|
|     None      |

#### Commands:

|         📋 Task         |   🔧 Command   | ⚙️ Permission |
|:-----------------------:|:--------------:|:-------------:|
|   Craving<sup>1</sup>   |   `/craving`   |     None      |
| Distraction<sup>1</sup> | `/distraction` |     None      |
|          Info           |    `/info`     |     None      |
|          Ping           |    `/ping`     |     None      |

###### <sup>1</sup> *Identical functionality* <!-- markdownlint-disable-line MD001 -->

---

### 🖧 Docker

#### Environment Variables:

|     📝 Description      | 📌 Variable |    {...} Value    |
|:-----------------------:|:-----------:|:-----------------:|
|        Activity         |  ACTIVITY   |    Distracting    |
| Embed Color<sup>1</sup> |    COLOR    |      #78866b      |
|         DB Name         |   DB_NAME   | distractionbot.db |
|         DB Path         |   DB_PATH   |       ./db        |
|          Debug          |    DEBUG    |  true/**false**   |
|        Bot Name         |    NAME     |  DistractionBot   |
|        Bot Token        |    TOKEN    |     \<token>      |

###### <sup>1</sup> #RRGGBB format <!-- markdownlint-disable-line MD001 -->

##### From `@postfmly/logoserver`:

| 📝 Description | 📌 Variable |     {...} Value     |
|:--------------:|:-----------:|:-------------------:|
|   Logo Name    |  LOGO_NAME  | distractionbot.webp |
|   Local Path   |  LOGO_PATH  |   ./utils/images    |
|      Port      |  LOGO_PORT  |  **Random**/[port]  |
|    Logo URL    |  LOGO_URL   |       \<url>        |

##### From `@postfmly/ratecheck`:

###### *NOTE: Rate limited to 1 request per 1 second*

#### Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

---

### 📃 Distractions

`./db/distractions.txt`

```txt
Distraction example
```

###### *NOTE: Automatically refreshed during startup* <!-- markdownlint-disable-line MD001 -->

---

### 📄 Documentation

### Generate:

```bash
./docs.sh
```

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted
- **Github Actions:** Builds and pushes images to repository
  - latest
    - amd64
    - arm64
