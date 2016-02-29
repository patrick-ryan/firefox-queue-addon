#!/bin/sh
FF_DIR=~/.mozilla/firefox/
DEFAULT_PROFILE=`ls ${FF_DIR} | grep .default`
jpm run --profile=${FF_DIR}${DEFAULT_PROFILE}