#!/bin/bash
action='load'

for arg in $@; do
    if [ $arg = '--push' ]; then
        action='push --platform=linux/arm64,linux/amd64'
    fi
done

docker buildx build -t ghcr.io/johnnylin-a/bapcsalescanada-watcher:latest --$action -f Dockerfile .