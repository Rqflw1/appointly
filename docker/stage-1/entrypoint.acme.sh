#!/bin/sh

acme.sh --issue --server letsencrypt -w /acme-challenge -k 4096 -d erekini.lv --renew-hook 'docker restart erekini-nginx'
crond
/bin/sh
