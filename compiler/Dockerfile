FROM ubuntu:16.04

RUN apt-get update && apt-get install -y \
        ca-certificates \
        cron \
        curl \
        openssl \
    && rm -rf /var/lib/apt/lists/*

# Add Docker client (from https://github.com/docker-library/docker/blob/master/1.13/Dockerfile)
ENV DOCKER_BUCKET get.docker.com
ENV DOCKER_VERSION 1.13.1
ENV DOCKER_SHA256 97892375e756fd29a304bd8cd9ffb256c2e7c8fd759e12a55a6336e15100ad75
RUN set -x \
        && curl -fSL "https://${DOCKER_BUCKET}/builds/Linux/x86_64/docker-${DOCKER_VERSION}.tgz" -o docker.tgz \
        && echo "${DOCKER_SHA256} *docker.tgz" | sha256sum -c - \
        && tar -xzvf docker.tgz \
        && mv docker/* /usr/local/bin/ \
        && rmdir docker \
        && rm docker.tgz \
        && docker -v

# use tini as 'init' for this container (https://github.com/krallin/tini)
ENV TINI_VERSION v0.14.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

COPY . /root/compiler/
WORKDIR /root/compiler

COPY crontab /etc/cron.d/rust-playground-cron
RUN touch /var/log/cron.log \
        && sed -i '/pam_loginuid/d' /etc/pam.d/cron
CMD cron -f

