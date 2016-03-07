#!/bin/sh
FF_DIR=~/Builds/firefox/
DEFAULT_PROFILE=`ls ${FF_DIR} | grep .default`
jpm run --profile=${FF_DIR}${DEFAULT_PROFILE} -b ${FF_DIR}/firefox