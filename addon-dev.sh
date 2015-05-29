#!/bin/sh
# cfx run -b ~/Builds/firefox/firefox-bin
FF_DIR=~/Builds/firefox/
DEFAULT_PROFILE=`ls ${FF_DIR} | grep .default`
cfx run --profiledir=${FF_DIR}${DEFAULT_PROFILE}