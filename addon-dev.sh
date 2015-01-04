#!/bin/sh
FF_DIR=~/.mozilla/firefox/
DEFAULT_PROFILE=`ls ${FF_DIR} | grep .default`
cfx run --profiledir=${FF_DIR}${DEFAULT_PROFILE}