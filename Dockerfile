# Default: builds base locally. For faster CI/CD builds, replace this stage
# with a pre-built image from your container registry (see README).
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="/root/.vite-plus/bin:$PNPM_HOME:$PATH"
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
SHELL ["/bin/bash", "-c"]
RUN curl -fsSL https://vite.plus | bash && vp --version

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN vp install --frozen-lockfile --ignore-scripts

FROM deps AS dev
COPY . .
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["vp", "dev", "--host", "0.0.0.0", "--port", "3000"]

FROM deps AS build
COPY . .
RUN vp build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
