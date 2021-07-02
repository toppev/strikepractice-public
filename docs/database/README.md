
## Host a database for StrikePractice in 2 minutes

Simple instructions to host database for StrikePractice in no time on your own VPS.
Note that you must have root access to your server.

### Instructions
1. Copy the correct `*database.docker-compose.yml` somewhere on your server
   - If you have 1.8.8 server, use `mc1.8-database.docker-compose.yml`
2. Install Docker and Docker Compose:
    - With apt (ubuntu, debian etc):
       ```bash
       sudo apt update && sudo apt install docker.io docker-compose
       ```
3. Start the pre-configured database:
    ```bash 
   sudo docker-compose --file mc1.8-database.docker-compose.yml up
   ```
   (or `sudo docker-compose --file mc1.8-database.docker-compose.yml up -d` to detach from the container)
4. Go to StrikePractice config.yml and copy the following:

```yaml
database:
  mysql: true
  host: localhost
  port: 5859 # port for this setup
  user: sprac-docker
  password: strikepracticeisbest
  name: strikepractice
```

5. You're done! Restarting should connect to that database

