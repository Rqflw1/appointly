#!/bin/sh

acme.sh --issue --server letsencrypt -w /acme-challenge -k 4096 -d stage.minicrm.local --renew-hook 'docker restart minicrm-nginx'
crond
/bin/sh
