# GScrap Service

Node.js microservice for GScrap functionality with gRPC-based inter-service communication.

## Badges

[![GitHub License](https://img.shields.io/github/license/FunnyPaper/GScrap)](https://github.com/FunnyPaper/GScrap/blob/main/LICENSE)

## Description

GScrap is a Node.js microservice that provides core scraping and data processing capabilities. It communicates via gRPC using protobuf definitions (managed with Buf) and supports multiple deployment modes including Docker containers and native Node.js execution.

## Project Structure

```
packages/gscrap/service/
├── src/                    # Application source
│   ├── server.ts           # gRPC server entry point
│   └── ...                 # Service handlers and utilities
├── proto/                  # Protobuf definition files
├── packages/core/          # GScrap core library (workspace)
├── scripts/                # Build and utility scripts
├── installer/              # Windows installer configuration
├── docker/                 # Docker-related files
├── patches/                # Package patches (patch-package)
├── package.json            # npm dependencies
├── tsconfig.json           # TypeScript configuration
├── buf.gen.yaml            # Buf protobuf code generation
└── buf.work.yaml           # Buf workspace configuration
```

## Prerequisites

- [Node.js](https://nodejs.org/) 24.x or later
- [npm](https://www.npmjs.com/) 9.x or later
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [Buf](https://buf.build/) (for protobuf code generation)
- [Nasm](https://www.nasm.us/pub/nasm/releasebuilds/) (for compiling Node into executable). It is recommended to use the newest version available.
- [Python](https://www.python.org/downloads/) (for compiling Node into executable). It is recommended to use Python 3.11.x. Building was tested on Python 3.11.9.
- [Visual Studio](https://visualstudio.microsoft.com/downloads/) (for compiling Node into executable). It needs C++ classic app development and Clang/LLVm support. It is recommended to use Visual Studio 2022 or later.

## Setup

```bash
# Install dependencies (runs buf generate automatically via postinstall)
npm install

# Or manually generate protobuf files
npm run gen:proto
```

## Available Modes & Scripts

### Development

```bash
# Start development server with ts-node
npm run start:dev

# Start with debug inspector
npm run start:debug
```

### Production

```bash
# Compile TypeScript
npm run build

# Bundle with ncc for standalone execution
npm run build:ncc

# Start production server
npm run start:prod
```

### Windows Build

```bash
# Compile and package as Windows executable
npm run build:windows:x64

# Create NSIS installer
npm run build:windows:nsis
```

### Docker

```bash
# Development mode
npm run docker:dev

# Production mode
npm run docker:prod

# Debug mode
npm run docker:debug

# Stop all containers
npm run docker:down
```

## Workspace Packages

This service includes the following workspace packages:

| Package | Path | Purpose |
|---------|------|---------|
| @gscrap/core | packages/core | Core GScrap library |

## Dependencies

| Dependency | Type | Version |
|-----------|------|---------|
| @grpc/grpc-js | runtime | 1.14.x |
| dotenv | runtime | 17.2.x |
| jsonwebtoken | runtime | 9.0.x |
| @bufbuild/protobuf | dev | 2.10.x |
| @bufbuild/buf | dev | 1.62.x |
| ts-proto | dev | 2.10.x |
| @vercel/ncc | dev | 0.38.x |
| nexe | dev | 5.0.x-beta |
| ts-node | dev | 10.9.x |
| typescript | dev | 5.9.x |

## License

[MIT License](LICENSE)