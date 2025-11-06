## Steps for setting up Prometheus / Grafana monitoring.

### Infra setup.

We are self-hosting this on a separate ec2 instance. See `monitoring.tf` for this setup. Key thing: Main app server has 3000 and 3005 egress exposed locally on the VPC so the monitoring instance can query /metrics endpoints for both SSR and API servers

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
