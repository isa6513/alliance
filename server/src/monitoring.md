## Steps for setting up Prometheus / Grafana monitoring.

### Infra setup.

We are self-hosting this on a separate ec2 instance. See `monitoring.tf` for this setup. The main app ec2 instance has 3000 and 3005 ingress exposed locally on the VPC so the monitoring instance can query appropriately. Overall setup is basically:

- Our main app server exposes `/metrics` endpoints that return prometheus structured logs via `prem-client`

- Prometheus (in a docker container) hits the `/metrics` (at the app server ip local to the VPC our main and monitoring instances are on endpoints) every 15 seconds and stores it on disk, then serves the data at `9090`. This is not secured at all so the 9090 port is not exposed publicly!

- Grafana (in another docker container) reads prometheus data from `prometheus:9090` (interal docker container port) and hosts the grafana ui on `:3001`.

### Monitoring setup on EC2

- `ssh ec2-user@[monitoring-ec2-ip]`

- (if needed) Install docker-compose

```
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose version
```

- setup docker containers

`mkdir -p ~/prometheus`

`cd ~/prometheus`

`nano prometheus.yml`

Paste in:

```
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app_server_ssr'
    static_configs:
      - targets: ['10.0.4.27:3000']  # take from `app_server_private_ip` tf output
  - job_name: 'app_server_api'
    static_configs:
      - targets: ['10.0.4.27:3005']  # take from `app_server_private_ip` tf output

```

`nano docker-compose.yml`

```
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
    ports:
      - '9090:9090'
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - '3001:3000'
    volumes:
      - ./grafana-data:/var/lib/grafana
    restart: unless-stopped
```

Running now will likely run into permission issues for the containers. To fix:

In `~/prometheus`:

`mkdir -p data`

`sudo chown -R 65534:65534 data`

`mkdir -p grafana-data`

`sudo chown -R 472:472 grafana-data`

Now we can run:

`docker-compose up -d`

Now `docker ps` should show both prometheus and grafana as running

At this point you should be able to go to [monitoring-ec2-ip]:3001 and see grafana running

## http stuff

We currently have this visible at `metrics.worldalliance.org`. Setting this up basically requires:

- Adding the appropriate dns record in [porkbun](https://porkbun.com) pointing to the ec2 ip

- Installing `nginx` on the ec2 and directing traffic from port 80 -> 3001 where grafana lives

- Installing `certbot` and running it to update the config to allow for 443 https -> 3001 also.

- Note `ingress` blocks in monitoring.tf for 80 and 443 to allow this.
