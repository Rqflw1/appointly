#!/bin/bash

# shellcheck disable=SC2034

readonly SERVER_LOCAL="local"
readonly SERVER_STAGE_1="stage-1"
readonly SERVER_PROD="production"
readonly SERVERS=("$SERVER_LOCAL" "$SERVER_STAGE_1" "$SERVER_PROD")

readonly IP_STAGE_1="51.15.34.217"
readonly IP_PROD="51.15.72.105"

readonly CONTEXT_LOCAL="default"
readonly CONTEXT_STAGE_1="erekini-stage-1"
readonly CONTEXT_PROD="erekini-production"

readonly DOCKER_ARGS_LOCAL=(--file ./docker/dev/compose.yml)
readonly DOCKER_ARGS_STAGE_1=(--file ./docker/stage-1/compose.yml)
readonly DOCKER_ARGS_PROD=(--file ./docker/prod/compose.yml)

readonly ACME="erekini-acme"
readonly NGINX="erekini-nginx"
readonly NEXTJS="erekini-nextjs"
readonly POSTGRES="erekini-postgres"
readonly ALL="all"
readonly SERVICES=("$ACME" "$NGINX" "$NEXTJS" "$POSTGRES" "$ALL")
