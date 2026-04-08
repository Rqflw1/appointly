#!/bin/bash

source ./scripts/constants.sh

echo "Select server:"
select server in "${SERVERS[@]}"; do
    echo
    case $server in
    "$SERVER_LOCAL")
        echo "Not implemented"
        exit
        ;;
    "$SERVER_STAGE_1")
        ssh root@"$IP_STAGE_1"
        ;;
    "$SERVER_PROD")
        ssh root@"$IP_PROD"
        ;;
    esac
    break
done
