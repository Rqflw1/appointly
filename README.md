# erekini

## Development environment

Clone repo to WSL
Decrypt .env files `npm run env`
Install node_modules on WSL `npm i`
Run docker containers with build `npm run up:build`
Initialize database `npm run db:push` (run in container)
Generate database client `npm run db:gen` (run in container)
For Shadcn allow access to ./postgres `chmod -R 755 ./postgres`

## Production environment

Copy SSH Key from PC to server `ssh-copy-id root@remotehost`
Install docker on server

## Scaleway

Create buckets `erekini-development` and `erekini-production`

Install AWS CLI to WSL (check latest guides).
Configure it to Scaleway (https://www.scaleway.com/en/docs/object-storage/api-cli/object-storage-aws-cli/ or check latest guides)
Configure access in `~/.aws/config`. (See Scaleway guide)
Use AWS CLI:

- to get CORS policies `aws s3api get-bucket-cors --bucket erekini-development`
- to set CORS policies `aws s3api put-bucket-cors --bucket erekini-development --cors-configuration file://./scaleway/cors.dev.json`
- to delete CORS policies `aws s3api delete-bucket-cors --bucket erekini-development`

## Initial deploy

Fill constants in `./scripts/constants.sh`
Create docker context `npm run create-context`
Deploy postgres
Create migrations `npm run migrate:dev`
Deploy migrations `npm run migrate:deploy`
Deploy nextjs

## Troubleshooting

### Docker/WSL file access error

Docker creates files under root user but WSL from your user. If they try to access each others files permission error may occur. Try `sudo chown -R $(whoami):$(whoami) ./my-file.txt` or `sudo chown -R user:user ./my-file.txt`

### Docker ssh error

Probably unknown host. Try to connect via `ssh root@remotehost`. Accept new host and exit.

### Scaleway CORS error

Check Scaleway guide (https://www.scaleway.com/en/docs/object-storage/api-cli/setting-cors-rules/) or view Scaleway section in this file.
