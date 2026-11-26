# Decent Scan Tool firmware (ESP-IDF)
cmake_minimum_required(VERSION 3.16)
# CI sets DST_VERSION from the git tag; otherwise ESP-IDF uses git describe.
if(DEFINED ENV{DST_VERSION})
    set(PROJECT_VER $ENV{DST_VERSION})
endif()

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(decent_scan_tool)
