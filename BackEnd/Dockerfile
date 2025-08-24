# BackEnd/Dockerfile (multi-stage, production-ready)
FROM node:18-alpine AS deps
WORKDIR /app
# copy only package manifests first for better layer caching
COPY package*.json ./
# install production deps only
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# install dev deps required for prisma generate, build etc.
RUN npm ci
# copy app source
# NOTE: In some CI or Docker environments Prisma's binary download is blocked.
# To avoid build failures, generate the Prisma client on the host before building
# the image (run `npx prisma generate` locally or in CI), so the generated
# artifacts are included in the build context. Remove the `npx prisma generate`
# step from the image to prevent network-dependent downloads during docker build.
COPY . .

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy only production node_modules and built app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app . 
# ensure non-root ownership
RUN chown -R node:node /app
USER node
# make port configurable via env (default 4000)
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -qO- --timeout=2 http://localhost:4000/health || exit 1
CMD ["npm", "run", "prod"]