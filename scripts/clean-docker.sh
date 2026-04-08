#!/bin/bash

source ./scripts/constants.sh

CONTEXT=""
echo "Select server:"
select server in "${SERVERS[@]}"; do
    echo
    case $server in
    "$SERVER_LOCAL")
        CONTEXT=$CONTEXT_LOCAL
        ;;
    "$SERVER_STAGE_1")
        CONTEXT=$CONTEXT_STAGE_1
        ;;
    "$SERVER_PROD")
        CONTEXT=$CONTEXT_PROD
        ;;
    esac
    break
done

docker --context "$CONTEXT" system df
echo

if [ "$CONTEXT" = "$CONTEXT_PROD" ]; then
    docker --context "$CONTEXT" container prune -f # Remove all stoped containers
fi
docker --context "$CONTEXT" image prune -af   # Remove all unused images (not referenced by any containers), not just dangling ones
docker --context "$CONTEXT" volume prune -af  # Remove all unused volumes (not referenced by any containers), not just anonymous ones
docker --context "$CONTEXT" network prune -f  # Remove all unused networks (not referenced by any containers)
docker --context "$CONTEXT" builder prune -af # Remove all unused build cache, not just dangling ones
echo
docker --context "$CONTEXT" system df
