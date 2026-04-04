#!/bin/bash
shopt -s globstar
 
# Clean previous build
rm -rf dist/
rm -f gscrap-service.exe
rm -rf build/
rm -rf bin/
 
# Build project and compile
npm run build:ncc
npm run build:windows:x64
 
# Organize output into build directory
mkdir build
cp gscrap-service build
cp -r --parents dist/**/*.node build/
cp .env build
cp -r --parents proto/**/*.proto build/
rm gscrap-service
 
# Build installers
npm run build:windows:nsis
 
# Organize installers output
mkdir bin
cp installer/gscrap-service-installer.exe bin/
rm installer/gscrap-service-installer.exe
 
echo "Build completed successfully!"