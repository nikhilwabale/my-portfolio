# syntax=docker/dockerfile:1

# ---- Build stage --------------------------------------------------------
# Full JDK only exists in this stage; it never ships in the runtime image.
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build

# Copy just the wrapper + POM first so dependency resolution is its own
# Docker layer - it stays cached across rebuilds that only touch src/.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src src
RUN ./mvnw -B -DskipTests package && \
    mv target/portfolio-api-*.jar target/app.jar

# ---- Runtime stage --------------------------------------------------------
# JRE, not JDK: no compiler, no jshell, nothing this app needs at runtime.
# Alpine (musl libc) keeps the base small, which matters twice over here:
# smaller pull/cold-start on Render's free tier, and a pure-Java app plus
# the PostgreSQL JDBC driver has no native-library reason to need glibc.
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /build/target/app.jar app.jar
RUN chown spring:spring app.jar
USER spring:spring

EXPOSE 8080

# Render sets PORT at runtime; application.yml already reads it
# (server.port: ${PORT:8080}), so this is just documentation here.

# Tuned for Render's free-tier 512MB container limit, not for throughput:
#   MaxRAMPercentage=50   -> heap capped around 256MB on a 512MB container,
#                            leaving room for metaspace/threads/native memory
#                            instead of a hardcoded -Xmx that stops adapting
#                            if the container limit ever changes.
#   UseSerialGC           -> G1 (the default) carries bookkeeping overhead
#                            suited to multi-GB heaps; Serial is the lower-
#                            memory, lower-complexity choice for a heap this
#                            small serving low request volume.
#   TieredStopAtLevel=1   -> C1-only JIT: skips C2's larger code cache and
#                            compiler threads, trading peak throughput this
#                            app doesn't need for a smaller footprint and
#                            faster warmup after Render's free-tier spin-down.
#   MaxMetaspaceSize/ReservedCodeCacheSize -> explicit ceilings so neither
#                            can grow past what the container can spare.
#   Xss512k                -> half the default 1MB per thread stack; paired
#                            with the small Tomcat thread pool (see
#                            application-prod.yml) to bound total thread
#                            memory instead of leaving it open-ended.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=50.0 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=64m -Xss512k"

# Liveness only (process/HTTP server up) - deliberately not /health/db, so a
# transient Neon blip doesn't put Docker/Render into a restart loop instead
# of just failing that one request. /health/db stays available for external
# uptime monitoring, where a human decides how to react to a DB-down alert.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -q -O- http://localhost:8080/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
