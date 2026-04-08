#!/bin/bash

source ./scripts/constants.sh

CONTEXT=""
DOCKER_ARGS=()
echo "Select server:"
select server in "${SERVERS[@]}"; do
    echo
    case $server in
    "$SERVER_LOCAL")
        echo "Not implemented"
        exit
        ;;
    "$SERVER_STAGE_1")
        CONTEXT=$CONTEXT_STAGE_1
        DOCKER_ARGS=("${DOCKER_ARGS_STAGE_1[@]}")
        ;;
    "$SERVER_PROD")
        CONTEXT=$CONTEXT_PROD
        DOCKER_ARGS=("${DOCKER_ARGS_PROD[@]}")
        ;;
    esac
    break
done

SERVICE=""
echo "Select service:"
select service in "${SERVICES[@]}"; do
    echo
    case $service in
    "$ACME" | "$NGINX" | "$NEXTJS" | "$POSTGRES")
        SERVICE=$service
        ;;
    "$ALL")
        SERVICE=""
        ;;
    esac
    break
done

docker --context "$CONTEXT" compose "${DOCKER_ARGS[@]}" build "$SERVICE"
# TODO: migrate here if nextjs is selected
docker --context "$CONTEXT" compose "${DOCKER_ARGS[@]}" up -d "$SERVICE"
