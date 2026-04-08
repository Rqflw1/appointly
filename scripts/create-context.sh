#!/bin/bash

source ./scripts/constants.sh

docker context create --docker host=ssh://root@"$IP_STAGE_1" "$CONTEXT_STAGE_1"
docker context create --docker host=ssh://root@"$IP_PROD" "$CONTEXT_PROD"
echo
docker context ls
