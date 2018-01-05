#!/bin/sh
NODE=$(which node)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

for file in $DIR/*
do
  node "$file"
done
