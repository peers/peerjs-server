FROM node:16

# based on https://github.com/whitesource/unified-agent-distribution/tree/master/dockerized

ENV DEBIAN_FRONTEND noninteractive
ENV JAVA_HOME       /usr/lib/jvm/java-8-openjdk-amd64
ENV PATH 	    	$JAVA_HOME/bin:$PATH
ENV LANGUAGE	en_US.UTF-8
ENV LANG    	en_US.UTF-8
ENV LC_ALL  	en_US.UTF-8

### add a new group + user without root premmsions
ENV WSS_GROUP wss-group
ENV WSS_USER wss-scanner
ENV WSS_USER_HOME=/home/${WSS_USER}

RUN groupadd ${WSS_GROUP} && \
  useradd --gid ${WSS_GROUP} --groups 0 --shell /bin/bash --home-dir ${WSS_USER_HOME} --create-home ${WSS_USER} && \
  passwd -d ${WSS_USER}

### Install wget, curl, git, unzip, gnupg, locales, rpm
RUN apt-get update && \
  apt-get -y install wget curl git unzip gnupg locales rpm && \
  locale-gen en_US.UTF-8 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /tmp/*

RUN wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | apt-key add - \
  && apt-get update && apt-get install -y software-properties-common \
  && add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/ \
  && apt-get update && apt-get install -y adoptopenjdk-8-hotspot \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /tmp/*

RUN wget https://github.com/whitesource/unified-agent-distribution/releases/download/v21.4.2/wss-unified-agent.jar \
  && chown -R ${WSS_USER}:${WSS_GROUP} wss-unified-agent.jar

# envsubst
RUN apt-get update && apt-get install -y gettext-base \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /tmp/*

COPY whitesource /whitesource
ENTRYPOINT [ "/whitesource/entrypoint.sh" ]
