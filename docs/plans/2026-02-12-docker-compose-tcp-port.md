# Docker Compose TCP Port Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose the TCP 9100 listener via Docker Compose using a configurable host port.

**Architecture:** Add a second port mapping in `docker-compose.yml` for TCP 9100 using an env var `TCP_HOST_PORT` with a default of `9100`. Update `README.md` to document the variable and usage.

**Tech Stack:** Docker Compose, Node.js (existing service).

### Task 1: Expose TCP 9100 in docker-compose

**Files:**
- Modify: `docker-compose.yml`

**Step 1: Add TCP port mapping**

In the `ports` list, add:

```yaml
- "${TCP_HOST_PORT:-9100}:9100"
```

**Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: expose TCP 9100 in compose"
```

### Task 2: Document TCP port env var

**Files:**
- Modify: `README.md`

**Step 1: Add note about TCP host port**

Add a short note in the TCP section indicating the default port and the `TCP_HOST_PORT` override.

Example:

```bash
# .env
TCP_HOST_PORT=9101
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document TCP_HOST_PORT"
```

## Notes
- No tests required.
